-- 修复「删除朋友账号和成员行，再用同一邮箱重新创建」产生的书籍成员旧 UUID。
-- 先运行 study-diagnose-members.sql，确认旧 UUID 和重新创建的朋友邮箱。
-- 仅适用于旧账号没有任何学习记录、也不是项目负责人的情况。
-- 本脚本不会合并、删除或重新归属任何学习记录，不会修改其他书籍内容。
-- 在 Supabase SQL Editor 中以 postgres 身份运行；不需要关闭 RLS 或禁用触发器。
-- 整份只有一条 DO 语句，不依赖临时表或跨语句事务；报错时整次修改自动回滚。
--
-- 使用方法：
-- 1. 仅替换下面 v_old 和 v_email 的旧 UUID、新账号邮箱。
-- 2. 保持 v_apply := false，运行全文；NOTICE 输出成员数组与 revision 的预览，不写入数据。
-- 3. 确认映射属于同一位朋友且书籍范围正确后，将 v_apply 改成 true，重新运行全文保存。
-- 4. 双方重新登录/立即同步。若收到旧版本冲突，先读取云端新版本再继续编辑。
-- 已经修复、没有匹配引用时只提示并返回，不重复修改。

do $repair$
declare
  v_apply boolean := false;
  v_old uuid := '00000000-0000-0000-0000-000000000000';
  v_email text := '替换成重新创建账号的邮箱';
  v_new uuid;
  v_room uuid;
  v_count integer;
  v_project public.study_records;
  v_active jsonb;
  v_former jsonb;
  v_payload jsonb;
begin
  v_email := lower(btrim(v_email));
  if v_old='00000000-0000-0000-0000-000000000000'::uuid or v_email='替换成重新创建账号的邮箱' then
    raise exception '请先填写诊断结果中的旧 UUID 和重新创建账号的真实邮箱。';
  end if;
  select count(*) into v_count from auth.users where lower(email)=v_email;
  if v_count<>1 then raise exception '新邮箱必须对应且只对应一个 Authentication 账号。'; end if;
  select id into strict v_new from auth.users where lower(email)=v_email for key share;
  if v_old=v_new then raise exception '旧 UUID 与新账号相同，不需要执行账号重建修复。'; end if;
  if exists(select 1 from auth.users where id=v_old) then
    raise exception '旧 Authentication 账号仍然存在。本脚本只修复已删除账号，不能自动合并两个账号。';
  end if;
  if exists(select 1 from public.study_members where user_id=v_old) then
    raise exception '旧 UUID 仍在学习空间成员目录中，请先核对诊断结果；本脚本不会删除成员。';
  end if;
  select room_id into v_room from public.study_members where user_id=v_new;
  if v_room is null then
    raise exception '新账号尚未加入学习空间。先通过 study_private.admin_add_member 加入正确的 room。';
  end if;
  perform 1 from public.study_rooms where id=v_room for update;
  perform 1 from public.study_members where user_id=v_new and room_id=v_room for key share;
  if not found then raise exception '新账号成员关系已变化，请重新运行诊断。'; end if;

  -- Any real ownership or historical record attribution requires a separate explicit migration.
  if exists(select 1 from public.study_records r where
    r.owner_id=v_old or r.payload->>'learnerId'=v_old::text or r.payload->>'targetLearnerId'=v_old::text or
    r.payload->>'ownerId'=v_old::text or (r.kind<>'project' and starts_with(r.id,v_old::text || ':'))
  ) then
    raise exception '旧 UUID 仍关联真实学习记录或项目负责人。为防止把他人的进度归给新账号，修复已取消；请保留原数据并单独核对历史归属。';
  end if;
  if exists(select 1 from public.study_records r where r.kind='project' and r.room_id<>v_room and
    ((r.payload->'memberIds') ? v_old::text or (r.payload->'formerMemberIds') ? v_old::text)
  ) then
    raise exception '旧 UUID 还出现在另一个 room 的书籍中，不能自动跨空间替换，请先核对账号归属。';
  end if;

  -- Match the normal write path's project locks, in stable order, before taking row locks.
  for v_project in select r.* from public.study_records r where r.kind='project' and r.room_id=v_room and
    ((r.payload->'memberIds') ? v_old::text or (r.payload->'formerMemberIds') ? v_old::text)
    order by r.id
  loop
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_room::text || ':' || v_project.id,812148));
  end loop;
  v_count := 0;
  for v_project in select r.* from public.study_records r where r.kind='project' and r.room_id=v_room and
    ((r.payload->'memberIds') ? v_old::text or (r.payload->'formerMemberIds') ? v_old::text)
    order by r.id for update
  loop
    if jsonb_typeof(v_project.payload->'memberIds') is distinct from 'array' or
       jsonb_typeof(v_project.payload->'formerMemberIds') is distinct from 'array' then
      raise exception '项目 % 的成员字段格式异常，请先核对，不能直接替换。',v_project.id;
    end if;
    select coalesce(jsonb_agg(member_id order by first_position),'[]'::jsonb) into v_active from (
      select case when value=v_old::text then v_new::text else value end as member_id,min(ordinality) as first_position
      from jsonb_array_elements_text(v_project.payload->'memberIds') with ordinality
      group by case when value=v_old::text then v_new::text else value end
    ) members;
    select coalesce(jsonb_agg(member_id order by first_position),'[]'::jsonb) into v_former from (
      select case when value=v_old::text then v_new::text else value end as member_id,min(ordinality) as first_position
      from jsonb_array_elements_text(v_project.payload->'formerMemberIds') with ordinality
      group by case when value=v_old::text then v_new::text else value end
    ) members where not (v_active ? member_id);

    if not (v_active ? v_project.owner_id::text) or
       exists(select 1 from jsonb_array_elements_text(v_active || v_former) member(value)
         where not exists(select 1 from public.study_members m where m.room_id=v_room and m.user_id::text=member.value)) then
      raise exception '项目 % 还有其他失效成员或负责人异常；本次全部回滚，请先核对完整诊断结果。',v_project.id;
    end if;
    v_payload := v_project.payload || jsonb_build_object('memberIds',v_active,'formerMemberIds',v_former,'revision',v_project.revision+1);
    perform study_private.validate_project(v_payload,v_project.payload);
    if v_apply then
      update public.study_records set payload=v_payload,revision=v_project.revision+1,updated_at=clock_timestamp()
        where room_id=v_room and kind='project' and id=v_project.id;
    end if;
    raise notice '项目「%」(%)：成员 % → %；历史成员 % → %；版本 % → %。',
      v_project.payload->>'title',v_project.id,v_project.payload->'memberIds',v_active,
      v_project.payload->'formerMemberIds',v_former,v_project.revision,v_project.revision+1;
    v_count := v_count+1;
  end loop;
  if v_count=0 then
    raise notice '此空间没有匹配的旧 UUID 成员引用，已修复或无需修复；未修改任何数据。';
    return;
  end if;
  if v_apply then
    raise notice '修复完成：更新 % 本书的成员引用。旧 UUID：%；新 UUID：%。所有学习记录与其他书籍内容均已保留。',v_count,v_old,v_new;
  else
    raise notice '预览完成：共 % 本书。旧 UUID：%；新 UUID：%。未写入任何数据；确认映射与范围后，将 v_apply 改为 true 再运行全文。',v_count,v_old,v_new;
  end if;
end;
$repair$;
