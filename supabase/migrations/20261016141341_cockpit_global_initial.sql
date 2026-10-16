-- Cockpit Global : projet Supabase dédié exclusivement à cette application.
create schema if not exists cockpit_private;
revoke all on schema cockpit_private from public, anon, authenticated;

create table public.cockpit_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.cockpit_members enable row level security;
revoke all on public.cockpit_members from anon, authenticated;
grant select on public.cockpit_members to authenticated;
create policy members_read_self on public.cockpit_members for select to authenticated using(user_id=(select auth.uid()));

create table cockpit_private.allowed_emails(email text primary key check(email=lower(email)));
alter table cockpit_private.allowed_emails enable row level security;
-- L'adresse autorisée est configurée séparément, jamais embarquée dans l'interface.

-- Trigger d'administration Auth uniquement ; non exposé par l'API, non appelable
-- par anon/authenticated. SECURITY DEFINER est nécessaire pour l'attribution des
-- droits après vérification de l'e-mail par le service Auth, sans JWT utilisateur.
create function cockpit_private.enroll_verified_owner() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.email_confirmed_at is not null and exists(select 1 from cockpit_private.allowed_emails where email=lower(new.email)) then
  insert into public.cockpit_members(user_id) values(new.id) on conflict do nothing;
 end if;
 return new;
end $$;
revoke all on function cockpit_private.enroll_verified_owner() from public, anon, authenticated;
create trigger cockpit_enroll_verified after insert or update of email_confirmed_at,email on auth.users for each row execute function cockpit_private.enroll_verified_owner();

create function public.cockpit_valid_projects(value jsonb) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
declare p jsonb; item jsonb; k text; s jsonb;
begin
 if value is null or jsonb_typeof(value)<>'array' or octet_length(value::text)>2000000 then return false; end if;
 if jsonb_array_length(value)>200 then return false; end if;
 if (select count(*)<>count(distinct x->>'id') from jsonb_array_elements(value) x) then return false; end if;
 for p in select * from jsonb_array_elements(value) loop
  if jsonb_typeof(p)<>'object' or not (p ?& array['id','name','category','summary','next','status','favorite','color','version','live','drive','legacy','gpt','updated','folders','tasks','versions','requests','notes','sessions','running']) then return false; end if;
  foreach k in array array['id','name','category','summary','next','status','color','version','live','drive','legacy','gpt','updated','notes','running'] loop
   if jsonb_typeof(p->k)<>'string' then return false; end if;
  end loop;
  if length(p->>'id')>100 or length(p->>'name') not between 1 and 100 or length(p->>'category')>50 or length(p->>'summary')>5000 or length(p->>'next')>1000 or length(p->>'version')>100 or length(p->>'notes')>30000 then return false; end if;
  if p->>'status' not in ('À préparer','En cours','En pause','Terminé') or jsonb_typeof(p->'favorite')<>'boolean' or p->>'color' !~* '^#[0-9a-f]{6}$' then return false; end if;
  if jsonb_typeof(p->'folders')<>'object' then return false; end if;
  foreach k in array array['live','drive','legacy','gpt'] loop
   if length(p->>k)>2000 or (p->>k<>'' and p->>k !~* '^https?://') then return false; end if;
  end loop;
  for s in select v from jsonb_each(p->'folders') as f(k,v) loop
   if jsonb_typeof(s)<>'string' or length(s#>>'{}')>2000 or (s#>>'{}'<>'' and s#>>'{}' !~* '^https?://') then return false; end if;
  end loop;
  foreach k in array array['tasks','versions','requests'] loop
   if jsonb_typeof(p->k)<>'array' or jsonb_array_length(p->k)>1000 then return false; end if;
   for item in select * from jsonb_array_elements(p->k) loop
    if jsonb_typeof(item)<>'object' or not(item ?& array['id','title','text','url','date','done']) then return false; end if;
    if jsonb_typeof(item->'id')<>'string' or jsonb_typeof(item->'title')<>'string' or length(item->>'title') not between 1 and 300 or jsonb_typeof(item->'text')<>'string' or length(item->>'text')>20000 or jsonb_typeof(item->'url')<>'string' or length(item->>'url')>2000 or (item->>'url'<>'' and item->>'url' !~* '^https?://') or jsonb_typeof(item->'date')<>'string' or jsonb_typeof(item->'done')<>'boolean' then return false; end if;
   end loop;
  end loop;
  if jsonb_typeof(p->'sessions')<>'array' or jsonb_array_length(p->'sessions')>5000 then return false; end if;
  for s in select * from jsonb_array_elements(p->'sessions') loop
   if not(s ?& array['id','start','end']) or jsonb_typeof(s->'id')<>'string' or jsonb_typeof(s->'start')<>'string' or jsonb_typeof(s->'end')<>'string' then return false; end if;
  end loop;
 end loop;
 return true;
exception when others then return false;
end $$;
revoke all on function public.cockpit_valid_projects(jsonb) from public, anon;
grant execute on function public.cockpit_valid_projects(jsonb) to authenticated;

create table public.cockpit_state (
 user_id uuid primary key references public.cockpit_members(user_id) on delete cascade,
 revision integer not null check(revision>=1),
 projects jsonb not null check(public.cockpit_valid_projects(projects)),
 updated_at timestamptz not null default now()
);
alter table public.cockpit_state enable row level security;
revoke all on public.cockpit_state from anon, authenticated;
grant select,insert,update on public.cockpit_state to authenticated;
create policy state_select on public.cockpit_state for select to authenticated using(user_id=(select auth.uid()) and user_id in(select user_id from public.cockpit_members));
create policy state_insert on public.cockpit_state for insert to authenticated with check(user_id=(select auth.uid()) and user_id in(select user_id from public.cockpit_members));
create policy state_update on public.cockpit_state for update to authenticated using(user_id=(select auth.uid()) and user_id in(select user_id from public.cockpit_members)) with check(user_id=(select auth.uid()) and user_id in(select user_id from public.cockpit_members));

create function public.save_cockpit(expected_revision integer,new_projects jsonb) returns integer
language plpgsql security invoker set search_path='' as $$
declare result integer; uid uuid:=auth.uid();
begin
 if uid is null or not exists(select 1 from public.cockpit_members where user_id=uid) then raise exception 'Accès refusé' using errcode='42501'; end if;
 if expected_revision is null or expected_revision<0 or not public.cockpit_valid_projects(new_projects) then raise exception 'Données invalides' using errcode='22023'; end if;
 if expected_revision=0 then
  insert into public.cockpit_state(user_id,revision,projects) values(uid,1,new_projects)
  on conflict(user_id) do nothing returning revision into result;
 else
  update public.cockpit_state set projects=new_projects,revision=revision+1,updated_at=now()
  where user_id=uid and revision=expected_revision returning revision into result;
 end if;
 if result is null then raise exception 'Conflit de révision' using errcode='40001'; end if;
 return result;
end $$;
revoke all on function public.save_cockpit(integer,jsonb) from public,anon;
grant execute on function public.save_cockpit(integer,jsonb) to authenticated;
