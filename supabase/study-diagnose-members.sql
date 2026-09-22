-- 学习空间成员诊断：仅查询，不修改任何数据。
-- 在 Supabase SQL Editor 中以 postgres 身份运行。
-- 第一份结果列出书籍引用、但已经不在该 room 成员目录中的旧账号 UUID。
-- 第二份结果列出当前有效账号；同邮箱重新创建的账号会获得不同 UUID。
-- 邮箱只供管理员辨认。不要把完整结果发到公开渠道。

with project_references as (
  select r.room_id, r.id as project_id, r.payload->>'title' as project_title,
    'memberIds' as reference_field, member.value as referenced_user_id
  from public.study_records r
  cross join lateral jsonb_array_elements_text(
    case when jsonb_typeof(r.payload->'memberIds')='array' then r.payload->'memberIds' else '[]'::jsonb end
  ) member(value)
  where r.kind='project'
  union all
  select r.room_id, r.id, r.payload->>'title', 'formerMemberIds', member.value
  from public.study_records r
  cross join lateral jsonb_array_elements_text(
    case when jsonb_typeof(r.payload->'formerMemberIds')='array' then r.payload->'formerMemberIds' else '[]'::jsonb end
  ) member(value)
  where r.kind='project'
  union all
  select r.room_id, r.id, r.payload->>'title', 'ownerId', r.payload->>'ownerId'
  from public.study_records r
  where r.kind='project' and r.payload->>'ownerId' is not null
)
select p.room_id, room.name as room_name, p.project_id, p.project_title,
  p.reference_field, p.referenced_user_id as missing_user_id,
  exists(select 1 from auth.users u where u.id::text=p.referenced_user_id) as old_auth_account_still_exists,
  (select count(*) from public.study_records r where
    r.owner_id::text=p.referenced_user_id or r.payload->>'learnerId'=p.referenced_user_id or
    r.payload->>'targetLearnerId'=p.referenced_user_id or r.payload->>'ownerId'=p.referenced_user_id or
    (r.kind<>'project' and starts_with(r.id,p.referenced_user_id || ':'))
  ) as records_requiring_identity_review
from project_references p
join public.study_rooms room on room.id=p.room_id
where not exists(select 1 from public.study_members m where m.room_id=p.room_id and m.user_id::text=p.referenced_user_id)
order by p.room_id, p.project_id, p.reference_field, p.referenced_user_id;

select m.room_id, room.name as room_name, m.display_name, u.email, m.user_id as current_user_id
from public.study_members m
join auth.users u on u.id=m.user_id
join public.study_rooms room on room.id=m.room_id
order by room.name, m.seat;
