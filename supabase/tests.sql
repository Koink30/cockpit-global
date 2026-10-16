
begin;
select set_config('test.cockpit_owner',gen_random_uuid()::text,true),set_config('test.cockpit_other',gen_random_uuid()::text,true);
insert into auth.users(id,email) values(current_setting('test.cockpit_owner')::uuid,'cockpit-a@example.invalid'),(current_setting('test.cockpit_other')::uuid,'cockpit-b@example.invalid');
insert into public.cockpit_members(user_id) values(current_setting('test.cockpit_owner')::uuid);
select set_config('request.jwt.claim.sub',current_setting('test.cockpit_owner'),true);
set local role authenticated;
select public.save_cockpit(0,'[{"id":"initial-0","name":"Merlet · Inscriptions","category":"Le Merlet","color":"#1d947e","summary":"Fiche de départ à compléter. Les données de ton cockpit local ne sont pas encore importées.","next":"","status":"À préparer","favorite":true,"version":"","live":"","drive":"","legacy":"","gpt":"","updated":"","folders":{},"tasks":[],"versions":[],"requests":[],"notes":"","sessions":[],"running":""},{"id":"initial-1","name":"Caves de Saint-Jean","category":"Clients","color":"#a0527f","summary":"Fiche de départ à compléter. Les données de ton cockpit local ne sont pas encore importées.","next":"","status":"À préparer","favorite":true,"version":"","live":"","drive":"","legacy":"","gpt":"","updated":"","folders":{},"tasks":[],"versions":[],"requests":[],"notes":"","sessions":[],"running":""},{"id":"initial-2","name":"BTC · CFD Lab","category":"Personnel","color":"#b18035","summary":"Fiche de départ à compléter. Les données de ton cockpit local ne sont pas encore importées.","next":"","status":"À préparer","favorite":false,"version":"","live":"","drive":"","legacy":"","gpt":"","updated":"","folders":{},"tasks":[],"versions":[],"requests":[],"notes":"","sessions":[],"running":""},{"id":"initial-3","name":"Mon Bureau","category":"Personnel","color":"#6860c8","summary":"Fiche de départ à compléter. Les données de ton cockpit local ne sont pas encore importées.","next":"","status":"À préparer","favorite":false,"version":"","live":"","drive":"","legacy":"","gpt":"","updated":"","folders":{},"tasks":[],"versions":[],"requests":[],"notes":"","sessions":[],"running":""},{"id":"initial-4","name":"Mas de Vallongue","category":"Personnel","color":"#68884b","summary":"Fiche de départ à compléter. Les données de ton cockpit local ne sont pas encore importées.","next":"","status":"À préparer","favorite":false,"version":"","live":"","drive":"","legacy":"","gpt":"","updated":"","folders":{},"tasks":[],"versions":[],"requests":[],"notes":"","sessions":[],"running":""}]'::jsonb) as first_revision;
do $$ begin
 if (select revision from public.cockpit_state where user_id=auth.uid())<>1 then raise exception 'TEST read failed'; end if;
 if public.save_cockpit(1,(select projects from public.cockpit_state where user_id=auth.uid()))<>2 then raise exception 'TEST update failed'; end if;
 begin perform public.save_cockpit(1,'[]');raise exception 'TEST stale write accepted'; exception when serialization_failure then null;end;
 begin perform public.save_cockpit(2,'{}');raise exception 'TEST invalid shape accepted'; exception when invalid_parameter_value then null;end;
 if public.cockpit_valid_projects('[{}]') then raise exception 'TEST incomplete accepted';end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.cockpit_other'),true);
do $$ begin
 if exists(select 1 from public.cockpit_state) then raise exception 'TEST cross-user leak';end if;
 if exists(select 1 from public.cockpit_members) then raise exception 'TEST membership leak';end if;
 begin perform public.save_cockpit(0,'[]');raise exception 'TEST unauthorized write';exception when insufficient_privilege then null;end;
 begin insert into public.cockpit_members(user_id) values(auth.uid());raise exception 'TEST privilege escalation';exception when insufficient_privilege then null;end;
end $$;
reset role;
do $$ begin
 if has_table_privilege('anon','public.cockpit_state','SELECT') then raise exception 'TEST anonymous SELECT allowed';end if;
 if has_function_privilege('anon','public.save_cockpit(integer,jsonb)','EXECUTE') then raise exception 'TEST anonymous RPC allowed';end if;
end $$;
select 'PASS: write/read, revision, conflict, validation, user isolation, membership protection, anonymous access' as result;
rollback;
