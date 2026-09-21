-- Run after study.sql as postgres in a DEVELOPMENT Supabase project.
-- All fixtures and workspace changes are rolled back. No passwords are stored here.
begin;
create or replace function pg_temp.assert_true(p_result boolean,p_label text)
returns void language plpgsql as $$ begin if p_result is distinct from true then raise exception 'FAILED: %',p_label; end if; end; $$;
create or replace function pg_temp.expect_error(p_sql text,p_state text)
returns void language plpgsql as $$
declare v_state text;
begin
  begin execute p_sql;
  exception when others then
    get stacked diagnostics v_state=returned_sqlstate;
    if v_state<>p_state then raise exception 'Expected %, got %: %',p_state,v_state,sqlerrm; end if;
    return;
  end;
  raise exception 'FAILED: expected SQLSTATE %',p_state;
end;
$$;

-- Isolate fixtures from an administrator's existing default workspace.
delete from study_private.settings;
insert into auth.users(id,email) values('10000000-0000-4000-8000-000000000001','study-test-a@example.invalid');
select set_config('study.test_room',study_private.configure_workspace('Permission tests','study-test-a@example.invalid','A')::text,true);
insert into auth.users(id,email) values
 ('10000000-0000-4000-8000-000000000002','study-test-b@example.invalid'),
 ('10000000-0000-4000-8000-000000000003','study-test-c@example.invalid'),
 ('10000000-0000-4000-8000-000000000004','study-test-d@example.invalid');
select pg_temp.assert_true((select count(*)=4 from public.study_members where room_id=current_setting('study.test_room')::uuid),'new provisioned accounts automatically join workspace; more than two supported');
select pg_temp.assert_true(to_regprocedure('public.study_create_room(text,text)') is null and to_regprocedure('public.study_join_room(text,text)') is null,'self-provisioning endpoints retired');

set local role authenticated;
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000001';
select pg_temp.assert_true(jsonb_array_length(public.study_my_room()->'members')=4,'directory exposes workspace account names');
select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',
 '{"subtitle":"Test","description":"","kind":"book","color":"#007aff","chapters":[{"id":"ch","title":"Chapter","packs":[{"id":"pack","title":"Pack","kind":"reading","reading":"1","minutes":"30","output":"Summary","bookPractice":"","base":true,"questions":[{"id":"q1","prompt":"Explain."}]}]}],"title":"Book one","ownerId":"10000000-0000-4000-8000-000000000001","memberIds":["10000000-0000-4000-8000-000000000001","10000000-0000-4000-8000-000000000002","10000000-0000-4000-8000-000000000003"]}',0);
select pg_temp.assert_true((select revision=1 and payload->>'revision'='1' from public.study_records where id='book-one'),'creation gets revision one');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'project','forged-owner',
 '{"subtitle":"Test","description":"","kind":"book","color":"#007aff","chapters":[{"id":"ch","title":"Chapter","packs":[{"id":"pack","title":"Pack","kind":"reading","reading":"1","minutes":"30","output":"Summary","bookPractice":"","base":true,"questions":[{"id":"q1","prompt":"Explain."}]}]}],"title":"Bad","ownerId":"10000000-0000-4000-8000-000000000002","memberIds":["10000000-0000-4000-8000-000000000001"]}',0)$q$,'42501');
select pg_temp.expect_error($q$select study_private.configure_workspace('Hijack','study-test-a@example.invalid','A')$q$,'42501');
select pg_temp.expect_error($q$update public.study_members set display_name='Forged'$q$,'42501');
select pg_temp.expect_error($q$insert into public.study_records(room_id,kind,id,owner_id,payload) values(current_setting('study.test_room')::uuid,'project','bypass',auth.uid(),'{}')$q$,'42501');

-- A group member may edit shared content, but cannot change membership or ownership.
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000002';
select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',
 (select payload || '{"title":"B edited content"}'::jsonb from public.study_records where id='book-one'),1);
select pg_temp.assert_true((select revision=2 and owner_id::text='10000000-0000-4000-8000-000000000001' from public.study_records where id='book-one'),'content edit preserves owner');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',
 (select payload || '{"memberIds":["10000000-0000-4000-8000-000000000001","10000000-0000-4000-8000-000000000002","10000000-0000-4000-8000-000000000003","10000000-0000-4000-8000-000000000004"]}'::jsonb from public.study_records where id='book-one'),2)$q$,'42501');
select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000002:book-one:pack:q1',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","questionId":"q1","text":"B original","learnerId":"forged"}',0);
select pg_temp.assert_true((select payload->>'learnerId'=owner_id::text from public.study_records where kind='answer'),'server canonicalizes learner identity');
select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000002:book-one:pack:q1',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","questionId":"q1","text":"B revised"}',1);
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000002:book-one:pack:q1',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","questionId":"q1","text":"stale overwrite"}',1)$q$,'P0001');

-- The owner removes B; B's old work remains for active learners, but B loses all access.
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000001';
select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',
 (select payload || '{"memberIds":["10000000-0000-4000-8000-000000000001","10000000-0000-4000-8000-000000000003"],"formerMemberIds":[]}'::jsonb from public.study_records where id='book-one'),2);
select pg_temp.assert_true((select payload->'formerMemberIds' ? '10000000-0000-4000-8000-000000000002' from public.study_records where id='book-one'),'removal retains former member audit');
select pg_temp.assert_true((select count(*)=1 from public.study_records where kind='answer'),'active member retains former member history');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000002:book-one:pack:q1',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","questionId":"q1","text":"owner impersonation"}',2)$q$,'42501');
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000002';
select pg_temp.assert_true((select count(*)=0 from public.study_records),'removed member cannot read even own historical records');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000002:book-one:pack:q1',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","questionId":"q1","text":"after removal"}',2)$q$,'42501');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',
 '{"subtitle":"Test","description":"","kind":"book","color":"#007aff","chapters":[{"id":"ch","title":"Chapter","packs":[{"id":"pack","title":"Pack","kind":"reading","reading":"1","minutes":"30","output":"Summary","bookPractice":"","base":true,"questions":[{"id":"q1","prompt":"Explain."}]}]}],"title":"Self rejoin","memberIds":["10000000-0000-4000-8000-000000000001","10000000-0000-4000-8000-000000000002"]}',3)$q$,'42501');

-- Same workspace, different book: no cross-book reads or writes.
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000004';
select pg_temp.assert_true((select count(*)=0 from public.study_records),'workspace directory membership does not grant book access');
select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-two',
 '{"subtitle":"Test","description":"","kind":"book","color":"#007aff","chapters":[{"id":"ch","title":"Chapter","packs":[{"id":"pack","title":"Pack","kind":"reading","reading":"1","minutes":"30","output":"Summary","bookPractice":"","base":true,"questions":[{"id":"q1","prompt":"Explain."}]}]}],"title":"Book two","memberIds":["10000000-0000-4000-8000-000000000004"]}',0);
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000004:s',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-01-01","minutes":30}',0)$q$,'42501');
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000001';
select pg_temp.assert_true((select count(*)=0 from public.study_records where id='book-two'),'book owner cannot read another persons book');
select pg_temp.expect_error($q$update public.study_records set payload='{}' where id='book-one'$q$,'42501');

-- CAS protects project edits and a re-added member regains their preserved history.
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000003';
select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',
 (select payload || '{"title":"C content revision"}'::jsonb from public.study_records where id='book-one'),3);
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000001';
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',
 (select payload || '{"title":"A stale overwrite"}'::jsonb from public.study_records where id='book-one'),3)$q$,'P0001');
select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',
 (select payload || '{"memberIds":["10000000-0000-4000-8000-000000000001","10000000-0000-4000-8000-000000000002","10000000-0000-4000-8000-000000000003"]}'::jsonb from public.study_records where id='book-one'),4);
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000002';
select pg_temp.assert_true((select payload->>'text'='B revised' from public.study_records where kind='answer'),'rejoining restores preserved history');

-- Time edits/voids also use CAS; a DST fallback day may contain 1500 minutes.
select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:session',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-01","minutes":1500}',0);
select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:session',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-01","minutes":60,"voidedAt":"2026-11-02T00:00:00Z"}',1);
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:session',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-01","minutes":45}',1)$q$,'P0001');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:bad',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-01-01","minutes":-1}',0)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:bad-date',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-02-30","minutes":30}',0)$q$,'22008');

-- Preserve the first completion date when a submission is later revised.
select public.study_save_record(current_setting('study.test_room')::uuid,'progress','10000000-0000-4000-8000-000000000002:book-one:pack',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","status":"submitted","completedAt":"2026-01-01T12:00:00Z","completedDate":"2026-01-01"}',0);
select public.study_save_record(current_setting('study.test_room')::uuid,'progress','10000000-0000-4000-8000-000000000002:book-one:pack',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","status":"revision","completedAt":"2026-02-01T12:00:00Z","completedDate":"2026-02-01"}',1);
select pg_temp.assert_true((select payload->>'completedDate'='2026-01-01' from public.study_records where kind='progress'),'first completion date is retained');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'progress','10000000-0000-4000-8000-000000000002:bad-status',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","status":"passed"}',0)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'review','10000000-0000-4000-8000-000000000002:self',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","targetLearnerId":"10000000-0000-4000-8000-000000000002","outcome":"passed","submissionUpdatedAt":"2026-01-01T00:00:00Z"}',0)$q$,'42501');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'review','10000000-0000-4000-8000-000000000002:outside',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","targetLearnerId":"10000000-0000-4000-8000-000000000004","outcome":"passed","submissionUpdatedAt":"2026-01-01T00:00:00Z"}',0)$q$,'42501');
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000001';
select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000001:book-one:pack:q1',
 '{"projectId":"book-one","packId":"pack","questionId":"q1","text":"A answer","updatedAt":"2026-01-01T00:00:00Z"}',0);
select public.study_save_record(current_setting('study.test_room')::uuid,'progress','10000000-0000-4000-8000-000000000001:book-one:pack',
 '{"projectId":"book-one","packId":"pack","status":"submitted","evidence":"Summary","note":"","updatedAt":"2026-01-01T00:00:00Z"}',0);
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000002';
select public.study_save_record(current_setting('study.test_room')::uuid,'review','10000000-0000-4000-8000-000000000002:book-one:pack:10000000-0000-4000-8000-000000000001',
 '{"updatedAt":"2026-01-01T00:00:00Z","createdAt":"2026-01-01T00:00:00Z","note":"","evidence":"Summary","projectId":"book-one","packId":"pack","targetLearnerId":"10000000-0000-4000-8000-000000000001","outcome":"passed","submissionUpdatedAt":"2026-01-01T00:00:00Z"}',0);

-- Malformed shared content must never poison the group state.
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',(select jsonb_set(payload,'{chapters}','[]') from public.study_records where id='book-one'),5)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',(select payload-'subtitle' from public.study_records where id='book-one'),5)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',(select jsonb_set(payload,'{chapters,0,packs}','[]') from public.study_records where id='book-one'),5)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',(select jsonb_set(payload,'{chapters,0,packs,0,questions}','[]') from public.study_records where id='book-one'),5)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',(select jsonb_set(payload,'{chapters,0,packs,0,base}','"yes"') from public.study_records where id='book-one'),5)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',(select jsonb_set(payload,'{chapters,0,packs,0,questions,0,prompt}','null') from public.study_records where id='book-one'),5)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'project','book-one',(select payload || '{"timeZone":"Invented/Zone"}'::jsonb from public.study_records where id='book-one'),5)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000002:book-one:pack:q1','{"projectId":"book-one","packId":"missing","questionId":"q1","text":"valid","updatedAt":"2026-01-01T00:00:00Z"}'::jsonb,2)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000002:book-one:pack:q1','{"projectId":"book-one","packId":"pack","questionId":"missing","text":"valid","updatedAt":"2026-01-01T00:00:00Z"}'::jsonb,2)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000002:book-one:pack:q1','{"projectId":"book-one","packId":"pack","questionId":"q1","text":"valid","updatedAt":"2026-02-30T00:00:00Z"}'::jsonb,2)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000002:book-one:pack:q1','{"projectId":"book-one","packId":"pack","questionId":"q1","text":null,"updatedAt":"2026-01-01T00:00:00Z"}'::jsonb,2)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000002:duplicate','{"projectId":"book-one","packId":"pack","questionId":"q1","text":"valid","updatedAt":"2026-01-01T00:00:00Z"}'::jsonb,0)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:malformed-session','{"projectId":"book-one","packId":"pack","chapterId":"missing","date":"2026-11-01","minutes":30,"note":"","createdAt":"2026-11-01T04:00:00Z"}'::jsonb,0)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:malformed-session','{"projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-01","minutes":1501,"note":"","createdAt":"2026-11-01T04:00:00Z"}'::jsonb,0)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:malformed-session','{"projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-01","minutes":30,"note":null,"createdAt":"2026-11-01T04:00:00Z"}'::jsonb,0)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:malformed-session','{"projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-01","minutes":30,"note":"","createdAt":"yesterday"}'::jsonb,0)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:malformed-session','{"projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-01","minutes":30,"note":"","createdAt":"2026-11-01T04:00:00Z","timeZone":"Invented/Zone"}'::jsonb,0)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:malformed-session','{"projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-01","minutes":30,"note":"","createdAt":"2026-11-01T04:00:00Z","timerAdjusted":"yes"}'::jsonb,0)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:malformed-session','{"projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-01","minutes":30,"note":"","createdAt":"2026-11-01T04:00:00Z","timerSegments":[]}'::jsonb,0)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:malformed-session','{"projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-01","minutes":30,"note":"","createdAt":"2026-11-01T04:00:00Z","timerSegments":[{"start":"2026-11-01T04:00:00Z","end":"2026-11-01T03:00:00Z"}]}'::jsonb,0)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:malformed-session','{"projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-01","minutes":30,"note":"","createdAt":"2026-11-01T04:00:00Z","timerSegments":[{"start":"2026-11-01T04:00:00Z","end":"2026-11-01T05:00:00Z"},{"start":"2026-11-01T04:30:00Z","end":"2026-11-01T06:00:00Z"}]}'::jsonb,0)$q$,'22023');
select public.study_save_record(current_setting('study.test_room')::uuid,'session','10000000-0000-4000-8000-000000000002:timer-segments','{"projectId":"book-one","packId":"pack","chapterId":"ch","date":"2026-11-02","minutes":45,"note":"","createdAt":"2026-11-01T04:00:00Z","timerAdjusted":true,"timeZone":"America/New_York","timerSegments":[{"start":"2026-11-01T04:00:00Z","end":"2026-11-01T05:00:00Z"},{"start":"2026-11-01T05:30:00Z","end":"2026-11-01T06:00:00Z"}]}'::jsonb,0);
-- Exact snapshot matching rejects nonexistent, outdated and changed submissions.
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'review','10000000-0000-4000-8000-000000000002:book-one:pack:10000000-0000-4000-8000-000000000001','{"projectId":"book-one","packId":"pack","targetLearnerId":"10000000-0000-4000-8000-000000000001","outcome":"passed","note":"","updatedAt":"2026-01-01T00:00:00Z","submissionUpdatedAt":"2026-01-02T00:00:00Z"}'::jsonb,1)$q$,'22023');
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'review','10000000-0000-4000-8000-000000000002:book-one:pack:10000000-0000-4000-8000-000000000003','{"projectId":"book-one","packId":"pack","targetLearnerId":"10000000-0000-4000-8000-000000000003","outcome":"passed","note":"","updatedAt":"2026-01-01T00:00:00Z","submissionUpdatedAt":"2026-01-01T00:00:00Z"}'::jsonb,0)$q$,'22023');
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000001';
select public.study_save_record(current_setting('study.test_room')::uuid,'answer','10000000-0000-4000-8000-000000000001:book-one:pack:q1','{"projectId":"book-one","packId":"pack","questionId":"q1","text":"Edited after submission","updatedAt":"2026-01-02T00:00:00Z"}'::jsonb,1);
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000002';
select pg_temp.expect_error($q$select public.study_save_record(current_setting('study.test_room')::uuid,'review','10000000-0000-4000-8000-000000000002:book-one:pack:10000000-0000-4000-8000-000000000001','{"projectId":"book-one","packId":"pack","targetLearnerId":"10000000-0000-4000-8000-000000000001","outcome":"passed","note":"","updatedAt":"2026-01-01T00:00:00Z","submissionUpdatedAt":"2026-01-01T00:00:00Z"}'::jsonb,1)$q$,'22023');
select pg_temp.assert_true((select revision=1 from public.study_records where kind='review'),'invalid review leaves prior revision untouched');

reset role;
set local role anon;
select pg_temp.expect_error('select * from public.study_records','42501');
select pg_temp.expect_error('select public.study_my_room()','42501');
reset role;
select 'All v2 book-isolation, provisioning, ownership, history, and CAS checks passed.' as result;
rollback;
