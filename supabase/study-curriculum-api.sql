-- Run once in Supabase SQL Editor. Installs APIs only; no learning data is deleted here.
begin;
create or replace function study_private.validate_project(p jsonb,p_old jsonb)
returns void language plpgsql stable set search_path=''
as $$
declare
  c jsonb; k jsonb; q jsonb; oc jsonb; ok jsonb; oq jsonb; nc jsonb; nk jsonb;
  chapter_ids text[] := '{}'; pack_ids text[] := '{}'; question_ids text[];
  pack_count integer := 0; question_count integer := 0;
begin
  if not study_private.valid_id(p->'id') or not study_private.valid_text(p->'title',500,true) or
     not study_private.valid_text(p->'subtitle',1000) or not study_private.valid_text(p->'description',100000) or
     coalesce(p->>'kind','') not in ('book','project') or coalesce(p->>'color','') !~ '^#[0-9a-fA-F]{6}$' or
     pg_catalog.jsonb_typeof(p->'chapters') is distinct from 'array' then
    raise exception '书籍基本信息不完整。' using errcode='22023';
  end if;
  if pg_catalog.jsonb_array_length(p->'chapters') not between 1 and 500 then raise exception '书籍至少需要一个章节。' using errcode='22023'; end if;
  if p ? 'timeZone' and (not study_private.valid_text(p->'timeZone',100,true) or not exists(select 1 from pg_catalog.pg_timezone_names where name=p->>'timeZone')) then
    raise exception '学习日历时区不正确。' using errcode='22023';
  end if;
  if p ? 'deletedPackIds' then
    if pg_catalog.jsonb_typeof(p->'deletedPackIds') is distinct from 'array' then raise exception '删除记录格式不正确。' using errcode='22023'; end if;
    if pg_catalog.jsonb_array_length(p->'deletedPackIds')>20000 or exists(
      select 1 from pg_catalog.jsonb_array_elements(p->'deletedPackIds') x where not study_private.valid_id(x)
    ) then raise exception '删除记录格式不正确。' using errcode='22023'; end if;
  end if;
  if p_old is not null and not (coalesce(p->'deletedPackIds','[]'::jsonb) @> coalesce(p_old->'deletedPackIds','[]'::jsonb)) then
    raise exception '已删除的学习包不能恢复，请同步最新书籍。' using errcode='22023';
  end if;
  if p ? 'deletedQuestionIds' then
    if pg_catalog.jsonb_typeof(p->'deletedQuestionIds') is distinct from 'object' then raise exception '习题删除记录格式不正确。' using errcode='22023'; end if;
    for nc in select pg_catalog.jsonb_build_object('id',key,'ids',value) from pg_catalog.jsonb_each(p->'deletedQuestionIds') loop
      if not study_private.valid_id(nc->'id') or pg_catalog.jsonb_typeof(nc->'ids') is distinct from 'array' then raise exception '习题删除记录格式不正确。' using errcode='22023'; end if;
      if pg_catalog.jsonb_array_length(nc->'ids')>1000 or exists(select 1 from pg_catalog.jsonb_array_elements(nc->'ids') x where not study_private.valid_id(x)) then raise exception '习题删除记录格式不正确。' using errcode='22023'; end if;
    end loop;
  end if;
  if p_old is not null and not (coalesce(p->'deletedQuestionIds','{}'::jsonb) @> coalesce(p_old->'deletedQuestionIds','{}'::jsonb)) then
    raise exception '已删除的习题不能恢复，请同步最新书籍。' using errcode='22023';
  end if;
  for c in select value from pg_catalog.jsonb_array_elements(p->'chapters') loop
    if not study_private.valid_id(c->'id') or (c->>'id')=any(chapter_ids) or not study_private.valid_text(c->'title',500,true) or pg_catalog.jsonb_typeof(c->'packs') is distinct from 'array' then
      raise exception '章节名称、编号或学习包不正确。' using errcode='22023';
    end if;
    chapter_ids := array_append(chapter_ids,c->>'id');
    if pg_catalog.jsonb_array_length(c->'packs') not between 1 and 2000 then raise exception '每章至少需要一个学习包。' using errcode='22023'; end if;
    for k in select value from pg_catalog.jsonb_array_elements(c->'packs') loop
      if coalesce(p->'deletedPackIds','[]'::jsonb) ? (k->>'id') then
        raise exception '已删除的旧学习包不能重新上传。' using errcode='22023';
      end if;
      pack_count := pack_count+1;
      if pack_count>20000 or not study_private.valid_id(k->'id') or (k->>'id')=any(pack_ids) or not study_private.valid_text(k->'title',500,true) or
         coalesce(k->>'kind','') not in ('reading','review','practice','lab') or not study_private.valid_text(k->'reading',100000) or
         not study_private.valid_text(k->'minutes',200) or not study_private.valid_text(k->'output',100000) or not study_private.valid_text(k->'bookPractice',100000) or
         pg_catalog.jsonb_typeof(k->'base') is distinct from 'boolean' or pg_catalog.jsonb_typeof(k->'questions') is distinct from 'array' then
        raise exception '学习包信息不完整或编号重复。' using errcode='22023';
      end if;
      pack_ids := array_append(pack_ids,k->>'id'); question_ids := '{}';
      if pg_catalog.jsonb_array_length(k->'questions')>1000 then raise exception '单个学习包的题目过多。' using errcode='22023'; end if;
      for q in select value from pg_catalog.jsonb_array_elements(k->'questions') loop
        if coalesce(p->'deletedQuestionIds'->(k->>'id'),'[]'::jsonb) ? (q->>'id') then raise exception '已删除的习题不能重新上传。' using errcode='22023'; end if;
        question_count := question_count+1;
        if question_count>100000 or not study_private.valid_id(q->'id') or (q->>'id')=any(question_ids) or not study_private.valid_text(q->'prompt',100000,true) or
           (q ? 'hint' and not study_private.valid_text(q->'hint',100000)) then raise exception '题目内容或编号不正确。' using errcode='22023'; end if;
        question_ids := array_append(question_ids,q->>'id');
      end loop;
    end loop;
  end loop;
  -- Existing chapter/pack/question identities stay stable so historical records retain their references.
  if p_old is not null then
    for oc in select value from pg_catalog.jsonb_array_elements(p_old->'chapters') loop
      select value into nc from pg_catalog.jsonb_array_elements(p->'chapters') where value->>'id'=oc->>'id';
      if nc is null then raise exception '已有章节不能删除，请保留历史学习结构。' using errcode='22023'; end if;
      for ok in select value from pg_catalog.jsonb_array_elements(oc->'packs') loop
        select value into nk from pg_catalog.jsonb_array_elements(nc->'packs') where value->>'id'=ok->>'id';
        if nk is null then raise exception '已有学习包不能删除或移动到其他章节。' using errcode='22023'; end if;
        for oq in select value from pg_catalog.jsonb_array_elements(ok->'questions') loop
          if not exists(select 1 from pg_catalog.jsonb_array_elements(nk->'questions') where value->>'id'=oq->>'id') then
            raise exception '已有习题不能删除，请保留历史答案。' using errcode='22023';
          end if;
        end loop;
      end loop;
    end loop;
  end if;
end;
$$;
revoke all on function study_private.valid_text(jsonb,integer,boolean),study_private.valid_id(jsonb),study_private.valid_timestamp(jsonb),study_private.valid_date(jsonb),study_private.validate_project(jsonb,jsonb) from public,anon,authenticated;

-- Writes are possible only through this checked transaction. Direct table writes have no grant.
create or replace function study_private.save_record(p_room_id uuid,p_kind text,p_id text,p_payload jsonb,p_expected_revision bigint)
returns public.study_records language plpgsql security definer set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_project public.study_records;
  v_old public.study_records;
  v_result public.study_records;
  v_pid text;
  v_payload jsonb := p_payload;
  v_active jsonb;
  v_former jsonb;
  v_revision bigint;
  v_minutes numeric;
  v_target text;
  v_has_old boolean;
  v_pack jsonb;
  v_chapter_id text;
  v_submission jsonb;
  v_segment jsonb;
  v_previous_end timestamptz;
begin
  if v_uid is null or p_room_id is distinct from study_private.my_room_id() then
    raise exception '你没有这个学习空间的访问权限。' using errcode='42501';
  end if;
  if p_kind not in ('project','progress','answer','session','review') or p_kind is null or
     not study_private.valid_id(pg_catalog.to_jsonb(p_id)) or
     pg_catalog.jsonb_typeof(p_payload) is distinct from 'object' or pg_catalog.octet_length(p_payload::text)>1048576 then
    raise exception '学习记录格式不正确。' using errcode='22023';
  end if;
  if p_expected_revision is null or p_expected_revision<0 then
    raise exception '请先同步最新记录后再保存。' using errcode='22023';
  end if;
  v_pid := case when p_kind='project' then p_id else p_payload->>'projectId' end;
  if coalesce(v_pid,'')='' then raise exception '请选择学习项目。' using errcode='22023'; end if;
  -- One lock per project serializes membership changes with personal writes and first project creation.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room_id::text || ':' || v_pid,812148));
  select * into v_project from public.study_records where room_id=p_room_id and kind='project' and id=v_pid for update;
  if p_kind<>'project' or v_project.id is not null then
    if v_project.id is null or not (v_project.payload->'memberIds' ? v_uid::text) then
      raise exception '你已不在这本书的学习小组中。' using errcode='42501';
    end if;
  end if;
  select * into v_old from public.study_records where room_id=p_room_id and kind=p_kind and id=p_id for update;
  v_has_old := found;
  if v_has_old and p_kind<>'project' and v_old.owner_id<>v_uid then
    raise exception '只能修改自己的学习记录。' using errcode='42501';
  end if;
  if (v_has_old and v_old.revision<>p_expected_revision) or (not v_has_old and p_expected_revision<>0) then
    raise exception 'STUDY_CONFLICT' using errcode='P0001',detail='记录已在另一处更新，请比较并合并后重新保存。';
  end if;
  v_revision := case when v_has_old then v_old.revision+1 else 1 end;
  v_payload := v_payload || pg_catalog.jsonb_build_object('id',p_id);
  if p_kind='project' then
    if (v_has_old and coalesce(p_payload->>'ownerId',v_old.owner_id::text)<>v_old.owner_id::text) or
       (not v_has_old and coalesce(p_payload->>'ownerId',v_uid::text)<>v_uid::text) then
      raise exception '项目负责人不能修改。' using errcode='42501';
    end if;
    v_active := p_payload->'memberIds';
    if pg_catalog.jsonb_typeof(v_active) is distinct from 'array' or pg_catalog.jsonb_array_length(v_active)=0 or
       not (v_active ? case when v_has_old then v_old.owner_id::text else v_uid::text end) then
      raise exception '学习小组必须包含项目负责人。' using errcode='22023';
    end if;
    if exists(select 1 from pg_catalog.jsonb_array_elements(v_active) member where pg_catalog.jsonb_typeof(member)<>'string') or
       (select count(*) from pg_catalog.jsonb_array_elements_text(v_active))<>(select count(distinct x) from pg_catalog.jsonb_array_elements_text(v_active) x) or
       exists(select 1 from pg_catalog.jsonb_array_elements_text(v_active) x where not exists(select 1 from public.study_members m where m.room_id=p_room_id and m.user_id::text=x)) then
      raise exception '请选择空间内已有的学习账号。' using errcode='22023';
    end if;
    if v_has_old and v_old.owner_id<>v_uid and not
       (v_active @> (v_old.payload->'memberIds') and (v_old.payload->'memberIds') @> v_active) then
      raise exception '只有项目负责人可以管理学习成员。' using errcode='42501';
    end if;
    if v_has_old and v_old.owner_id<>v_uid and v_payload->'chapters' is distinct from v_old.payload->'chapters' then
      raise exception '只有本书创建者可以管理学习包和题目。' using errcode='42501';
    end if;
    -- Tombstones are generated only by the deletion RPCs.
    if coalesce(v_payload->'deletedPackIds','[]'::jsonb) is distinct from coalesce(v_old.payload->'deletedPackIds','[]'::jsonb) or
       coalesce(v_payload->'deletedQuestionIds','{}'::jsonb) is distinct from coalesce(v_old.payload->'deletedQuestionIds','{}'::jsonb) then
      raise exception '请通过删除接口更新学习内容。' using errcode='22023';
    end if;
    -- The server derives inactive historical membership; clients cannot erase or fabricate it.
    select coalesce(pg_catalog.jsonb_agg(x order by x),'[]'::jsonb) into v_former from (
      select distinct x from pg_catalog.jsonb_array_elements_text(
        case when v_has_old then coalesce(v_old.payload->'formerMemberIds','[]'::jsonb) || coalesce(v_old.payload->'memberIds','[]'::jsonb) else '[]'::jsonb end
      ) x where not (v_active ? x)
    ) historical;
    perform study_private.validate_project(v_payload,case when v_has_old then v_old.payload else null end);
    v_payload := v_payload || pg_catalog.jsonb_build_object('ownerId',case when v_has_old then v_old.owner_id::text else v_uid::text end,
      'memberIds',v_active,'formerMemberIds',v_former,'revision',v_revision);
  else
    if left(p_id,37)<>v_uid::text || ':' then raise exception '记录归属不正确。' using errcode='42501'; end if;
    if v_has_old and v_old.project_id<>v_pid then raise exception '记录不能移到其他项目。' using errcode='42501'; end if;
    v_payload := v_payload || pg_catalog.jsonb_build_object('learnerId',v_uid::text);
    if not study_private.valid_id(v_payload->'projectId') or not study_private.valid_id(v_payload->'packId') then raise exception '请选择有效的学习包。' using errcode='22023'; end if;
    select pack,c->>'id' into v_pack,v_chapter_id
      from pg_catalog.jsonb_array_elements(v_project.payload->'chapters') c,
           pg_catalog.jsonb_array_elements(c->'packs') pack where pack->>'id'=v_payload->>'packId';
    if v_pack is null then raise exception '学习包已不存在，请同步后重试。' using errcode='22023'; end if;
    if p_kind<>'session' and not study_private.valid_timestamp(v_payload->'updatedAt') then raise exception '记录更新时间不正确。' using errcode='22023'; end if;
    if p_kind in ('progress','session','review') and not study_private.valid_text(v_payload->'note',100000) then raise exception '学习备注格式不正确。' using errcode='22023'; end if;
  end if;
  if p_kind='progress' then
    if p_id<>v_uid::text || ':' || v_pid || ':' || (v_payload->>'packId') or not study_private.valid_text(v_payload->'evidence',100000) then
      raise exception '学习记录编号或成果格式不正确。' using errcode='22023';
    end if;
    if coalesce(v_payload->>'status','') not in ('studying','submitted','revision') then
      raise exception '学习状态不正确。' using errcode='22023';
    end if;
    if v_has_old and v_old.payload ? 'completedAt' then v_payload := v_payload || pg_catalog.jsonb_build_object('completedAt',v_old.payload->'completedAt'); end if;
    if v_has_old and v_old.payload ? 'completedDate' then v_payload := v_payload || pg_catalog.jsonb_build_object('completedDate',v_old.payload->'completedDate'); end if;
    if (v_payload ? 'completedAt' or v_payload ? 'completedDate') and
       (not study_private.valid_timestamp(v_payload->'completedAt') or not study_private.valid_date(v_payload->'completedDate')) then
      raise exception '首次完成时间不正确。' using errcode='22023';
    end if;
  end if;
  if p_kind='answer' and (not study_private.valid_id(v_payload->'questionId') or not study_private.valid_text(v_payload->'text',100000) or
     p_id<>v_uid::text || ':' || v_pid || ':' || (v_payload->>'packId') || ':' || (v_payload->>'questionId') or
     not exists(select 1 from pg_catalog.jsonb_array_elements(v_pack->'questions') q where q->>'id'=v_payload->>'questionId')) then
    raise exception '习题答案格式不正确。' using errcode='22023';
  end if;
  if p_kind='session' then
    if v_chapter_id is distinct from v_payload->>'chapterId' or not study_private.valid_timestamp(v_payload->'createdAt') or
       (v_payload ? 'updatedAt' and not study_private.valid_timestamp(v_payload->'updatedAt')) or
       (v_payload ? 'voidedAt' and not study_private.valid_timestamp(v_payload->'voidedAt')) then
      raise exception '学习章节或记录时间不正确。' using errcode='22023';
    end if;
    if v_has_old then v_payload := v_payload || pg_catalog.jsonb_build_object('createdAt',v_old.payload->'createdAt'); end if;
    if (v_payload ? 'timeZone' and (not study_private.valid_text(v_payload->'timeZone',100,true) or not exists(select 1 from pg_catalog.pg_timezone_names where name=v_payload->>'timeZone'))) or
       (v_payload ? 'timerAdjusted' and pg_catalog.jsonb_typeof(v_payload->'timerAdjusted') is distinct from 'boolean') then
      raise exception '计时记录时区或调整标记不正确。' using errcode='22023';
    end if;
    if v_payload ? 'timerSegments' then
      if pg_catalog.jsonb_typeof(v_payload->'timerSegments') is distinct from 'array' then raise exception '计时片段格式不正确。' using errcode='22023'; end if;
      if pg_catalog.jsonb_array_length(v_payload->'timerSegments') not between 1 and 1000 then raise exception '计时片段数量不正确。' using errcode='22023'; end if;
      for v_segment in select value from pg_catalog.jsonb_array_elements(v_payload->'timerSegments') loop
        if not study_private.valid_timestamp(v_segment->'start') or not study_private.valid_timestamp(v_segment->'end') then
          raise exception '计时片段起止时间不正确。' using errcode='22023';
        end if;
        if (v_segment->>'end')::timestamptz<=(v_segment->>'start')::timestamptz or
           (v_previous_end is not null and (v_segment->>'start')::timestamptz<v_previous_end) then
          raise exception '计时片段必须按时间排列且不能重叠。' using errcode='22023';
        end if;
        v_previous_end := (v_segment->>'end')::timestamptz;
      end loop;
      -- Raw segments remain evidence after a manual date/minute adjustment, so sums/dates need not match.
    end if;
    if pg_catalog.jsonb_typeof(v_payload->'minutes') is distinct from 'number' then raise exception '学习时长必须是数字。' using errcode='22023'; end if;
    v_minutes := (v_payload->>'minutes')::numeric;
    if v_minutes<=0 or v_minutes>1500 then raise exception '单条时长应在 0–1500 分钟之间。' using errcode='22023'; end if;
    if coalesce(v_payload->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' or coalesce(v_payload->>'chapterId','')='' then
      raise exception '学习日期或章节不正确。' using errcode='22023';
    end if;
    perform (v_payload->>'date')::date;
    if v_payload ? 'voidedAt' then perform (v_payload->>'voidedAt')::timestamptz; end if;
  end if;
  if p_kind='review' then
    v_target := v_payload->>'targetLearnerId';
    if v_target is null or v_target=v_uid::text or not (v_project.payload->'memberIds' ? v_target) then
      raise exception '只能审核同一本书内其他在学成员的提交。' using errcode='42501';
    end if;
    if coalesce(v_payload->>'outcome','') not in ('passed','changes') or not study_private.valid_timestamp(v_payload->'submissionUpdatedAt') or
       p_id<>v_uid::text || ':' || v_pid || ':' || (v_payload->>'packId') || ':' || v_target then
      raise exception '审核结果或提交版本不正确。' using errcode='22023';
    end if;
    select payload into v_submission from public.study_records where room_id=p_room_id and kind='progress'
      and id=v_target || ':' || v_pid || ':' || (v_payload->>'packId');
    if v_submission is null or v_submission->>'status'<>'submitted' or
       v_submission->>'updatedAt' is distinct from v_payload->>'submissionUpdatedAt' then
      raise exception '这份提交已更新，请刷新后重新审核。' using errcode='22023';
    end if;
    if exists(select 1 from pg_catalog.jsonb_array_elements(v_pack->'questions') q where not exists(
      select 1 from public.study_records a where a.room_id=p_room_id and a.kind='answer'
        and a.id=v_target || ':' || v_pid || ':' || (v_payload->>'packId') || ':' || (q->>'id')
        and btrim(a.payload->>'text')<>'' and (a.payload->>'updatedAt')::timestamptz<=(v_submission->>'updatedAt')::timestamptz
    )) or (v_payload->>'outcome'='passed' and btrim(coalesce(v_submission->>'evidence',''))='') then
      raise exception '提交的答案或成果已变化，请伙伴重新提交后再审核。' using errcode='22023';
    end if;
  end if;
  insert into public.study_records(room_id,kind,id,owner_id,payload,project_id,revision,updated_at)
    values(p_room_id,p_kind,p_id,case when v_has_old then v_old.owner_id else v_uid end,v_payload,v_pid,v_revision,pg_catalog.clock_timestamp())
  on conflict(room_id,kind,id) do update set payload=excluded.payload,revision=excluded.revision,updated_at=excluded.updated_at
  returning * into v_result;
  return v_result;
end;
$$;
revoke all on function study_private.save_record(uuid,text,text,jsonb,bigint) from public,anon;
grant execute on function study_private.save_record(uuid,text,text,jsonb,bigint) to authenticated;

create or replace function public.study_replace_chapter_one(
  p_room_id uuid, p_project_id text, p_chapter jsonb, p_expected_revision bigint
) returns public.study_records
language plpgsql security definer set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_old public.study_records; v_result public.study_records;
  v_chapter jsonb; v_next_chapter jsonb; v_payload jsonb; v_comparison jsonb;
  v_removed text[]; v_new_count integer; v_revision bigint;
  v_new_ids text[] := array['ch1-01','ch1-02','ch1-03','ch1-04','ch1-05','ch1-R','ch1-P','ch1-P02','ch1-P03','ch1-P04','ch1-P05','ch1-P06','ch1-X01','ch1-X02','ch1-X03'];
  v_old_ids text[] := array['1-01','1-02','1-03','1-04','1-05','1-R','1-P'];
begin
  if v_uid is null or p_room_id is distinct from study_private.my_room_id() then
    raise exception '请登录对应的学习空间。' using errcode='42501';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room_id::text || ':' || p_project_id,812148));
  select * into v_old from public.study_records
    where room_id=p_room_id and kind='project' and id=p_project_id for update;
  if not found or v_old.owner_id<>v_uid or not (v_old.payload->'memberIds' ? v_uid::text) then
    raise exception '只有本书创建者可以删除旧学习包。' using errcode='42501';
  end if;
  if p_expected_revision is null or p_expected_revision<>v_old.revision then
    raise exception 'STUDY_CONFLICT' using errcode='P0001',detail='书籍已在另一处更新，请同步后重试。';
  end if;
  if v_old.payload->>'kind'<>'book' or not (p_project_id='computer-networking' or
    p_project_id ~* '^networking-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') then
    raise exception '此接口仅用于计算机网络第一章旧学习包。' using errcode='22023';
  end if;
  if p_chapter is null or pg_catalog.octet_length(p_chapter::text)>524288 or
    p_chapter->>'id' is distinct from '1' or pg_catalog.jsonb_typeof(p_chapter->'packs') is distinct from 'array' then
    raise exception '新版第一章内容不完整。' using errcode='22023';
  end if;
  if pg_catalog.jsonb_array_length(p_chapter->'packs')<>15 or
    exists(select 1 from pg_catalog.jsonb_array_elements(p_chapter->'packs') k where not (coalesce(k->>'id','')=any(v_new_ids))) then
    raise exception '新版第一章的学习包编号不正确。' using errcode='22023';
  end if;
  select c into v_chapter from pg_catalog.jsonb_array_elements(v_old.payload->'chapters') c where c->>'id'='1';
  if v_chapter is null then raise exception '没有可更新的第一章。' using errcode='22023'; end if;
  select count(*) into v_new_count from pg_catalog.jsonb_array_elements(v_chapter->'packs') k where k->>'id'=any(v_new_ids);
  if v_new_count not in (0,15) then raise exception '第一章已存在部分新版编号，请先检查学习计划。' using errcode='22023'; end if;
  if v_new_count=0 and exists(select 1 from unnest(v_old_ids) x where not exists(
    select 1 from pg_catalog.jsonb_array_elements(v_chapter->'packs') k where k->>'id'=x
  )) then raise exception '未识别到完整旧版学习计划。' using errcode='22023'; end if;
  select coalesce(array_agg(k->>'id'),'{}'::text[]) into v_removed
    from pg_catalog.jsonb_array_elements(v_chapter->'packs') k
    where v_new_count=0 or k->>'id'=any(v_old_ids) or k->'archived'='true'::jsonb;
  if v_new_count=15 and exists(select 1 from unnest(v_new_ids) x where x=any(v_removed)) then
    raise exception '新版学习包不能由旧版清理接口删除。' using errcode='22023';
  end if;
  if cardinality(v_removed)=0 then return v_old; end if;
  if v_new_count=0 then
    v_next_chapter := pg_catalog.jsonb_set(v_chapter,'{packs}',p_chapter->'packs');
  else
    select pg_catalog.jsonb_set(v_chapter,'{packs}',coalesce(pg_catalog.jsonb_agg(k order by n),'[]'::jsonb)) into v_next_chapter
      from pg_catalog.jsonb_array_elements(v_chapter->'packs') with ordinality a(k,n) where not (k->>'id'=any(v_removed));
  end if;
  select pg_catalog.jsonb_set(v_old.payload,'{chapters}',pg_catalog.jsonb_agg(case when c->>'id'='1' then v_next_chapter else c end order by n)) into v_payload
    from pg_catalog.jsonb_array_elements(v_old.payload->'chapters') with ordinality a(c,n);
  select v_payload || pg_catalog.jsonb_build_object('deletedPackIds',coalesce(pg_catalog.jsonb_agg(x order by x),'[]'::jsonb)) into v_payload from (
    select distinct x from pg_catalog.jsonb_array_elements_text(coalesce(v_old.payload->'deletedPackIds','[]'::jsonb) || pg_catalog.to_jsonb(v_removed)) x
  ) deleted;
  -- Normal curriculum validation still protects every unrelated chapter, pack and question.
  select pg_catalog.jsonb_set(v_old.payload,'{chapters}',pg_catalog.jsonb_agg(case when c->>'id'='1' then pg_catalog.jsonb_set(c,'{packs}',
    (select coalesce(pg_catalog.jsonb_agg(k order by kn),'[]'::jsonb) from pg_catalog.jsonb_array_elements(c->'packs') with ordinality ka(k,kn) where not (k->>'id'=any(v_removed)))) else c end order by n)) into v_comparison
    from pg_catalog.jsonb_array_elements(v_old.payload->'chapters') with ordinality a(c,n);
  perform study_private.validate_project(v_payload,v_comparison);
  v_revision := v_old.revision+1;
  v_payload := v_payload || pg_catalog.jsonb_build_object('revision',v_revision);
  delete from public.study_records where room_id=p_room_id and project_id=p_project_id and kind<>'project' and payload->>'packId'=any(v_removed);
  update public.study_records set payload=v_payload, revision=v_revision, updated_at=pg_catalog.clock_timestamp()
    where room_id=p_room_id and kind='project' and id=p_project_id returning * into v_result;
  return v_result;
end;
$$;
revoke all on function public.study_replace_chapter_one(uuid,text,jsonb,bigint) from public,anon;
grant execute on function public.study_replace_chapter_one(uuid,text,jsonb,bigint) to authenticated;
notify pgrst, 'reload schema';

-- Delete one question and all of its answers atomically; other learning records remain.
create or replace function public.study_delete_question(p_room_id uuid,p_project_id text,p_pack_id text,p_question_id text,p_expected_revision bigint)
returns public.study_records language plpgsql security definer set search_path=''
as $$
declare
  v_uid uuid := auth.uid(); v_old public.study_records; v_result public.study_records;
  v_payload jsonb; v_chapters jsonb; v_deleted jsonb; v_pack jsonb;
begin
  if v_uid is null or p_room_id is distinct from study_private.my_room_id() then raise exception '无权访问该学习空间。' using errcode='42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_room_id::text || ':' || p_project_id,812148));
  select * into v_old from public.study_records where room_id=p_room_id and kind='project' and id=p_project_id for update;
  if not found or v_old.owner_id<>v_uid or not (v_old.payload->'memberIds' ? v_uid::text) then raise exception '只有本书创建者可以管理题目。' using errcode='42501'; end if;
  if p_expected_revision is null or v_old.revision<>p_expected_revision then raise exception 'STUDY_CONFLICT' using errcode='P0001'; end if;
  select k.value into v_pack from pg_catalog.jsonb_array_elements(v_old.payload->'chapters') c,
    lateral pg_catalog.jsonb_array_elements(c.value->'packs') k where k.value->>'id'=p_pack_id;
  if v_pack is null then raise exception '学习包不存在。' using errcode='22023'; end if;
  if not exists(select 1 from pg_catalog.jsonb_array_elements(v_pack->'questions') q where q->>'id'=p_question_id) then
    if coalesce(v_old.payload->'deletedQuestionIds'->p_pack_id,'[]'::jsonb) ? p_question_id then return v_old; end if;
    raise exception '题目不存在。' using errcode='22023';
  end if;
  select pg_catalog.jsonb_agg(pg_catalog.jsonb_set(c.value,'{packs}',(
    select pg_catalog.jsonb_agg(case when k.value->>'id'=p_pack_id then pg_catalog.jsonb_set(k.value,'{questions}',
      (select coalesce(pg_catalog.jsonb_agg(q.value order by q.ord),'[]'::jsonb) from pg_catalog.jsonb_array_elements(k.value->'questions') with ordinality q(value,ord) where q.value->>'id'<>p_question_id)) else k.value end order by k.ord)
    from pg_catalog.jsonb_array_elements(c.value->'packs') with ordinality k(value,ord))) order by c.ord)
    into v_chapters from pg_catalog.jsonb_array_elements(v_old.payload->'chapters') with ordinality c(value,ord);
  v_deleted := coalesce(v_old.payload->'deletedQuestionIds','{}'::jsonb);
  v_deleted := pg_catalog.jsonb_set(v_deleted,array[p_pack_id],coalesce(v_deleted->p_pack_id,'[]'::jsonb)||pg_catalog.jsonb_build_array(p_question_id));
  v_payload := v_old.payload || pg_catalog.jsonb_build_object('chapters',v_chapters,'deletedQuestionIds',v_deleted,'revision',v_old.revision+1);
  perform study_private.validate_project(v_payload,pg_catalog.jsonb_set(v_old.payload,'{chapters}',v_chapters));
  delete from public.study_records where room_id=p_room_id and kind='answer' and payload->>'projectId'=p_project_id and payload->>'packId'=p_pack_id and payload->>'questionId'=p_question_id;
  update public.study_records set payload=v_payload,revision=v_old.revision+1,updated_at=pg_catalog.now()
    where room_id=p_room_id and kind='project' and id=p_project_id returning * into v_result;
  return v_result;
end;
$$;
revoke all on function public.study_delete_question(uuid,text,text,text,bigint) from public,anon;
grant execute on function public.study_delete_question(uuid,text,text,text,bigint) to authenticated;
notify pgrst,'reload schema';

commit;
