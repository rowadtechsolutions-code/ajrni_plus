-- ========== USERS (exact schema without role column) ==========
create table if not exists public."Users" (
  id uuid not null default auth.uid(),
  created_at timestamp with time zone not null default now(),
  full_name text null,
  email text null,
  phone_number text null,
  country text null,
  city text null,
  constraint Users_pkey primary key (id)
);

alter table public."Users" enable row level security;

create policy "Users can view own row" on public."Users" for select using (id = auth.uid());
create policy "Users can insert own row" on public."Users" for insert with check (id = auth.uid());
create policy "Users can update own row" on public."Users" for update using (id = auth.uid());

-- ========== OFFICES (exact schema) ==========
create table if not exists public."Offices" (
  id uuid not null default auth.uid(),
  created_at timestamp with time zone not null default now(),
  office_name text null,
  email text null,
  phone_number text null,
  country text null,
  city text null,
  is_active boolean null default false,
  constraint Offices_pkey primary key (id)
);

alter table public."Offices" enable row level security;

create policy "Offices readable by all" on public."Offices" for select using (true);
create policy "Offices insertable by owner" on public."Offices" for insert with check (id = auth.uid());
create policy "Offices updatable by owner" on public."Offices" for update using (id = auth.uid());

-- ========== TRIGGER (inserts into both tables) ==========
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  -- Insert into Users
  insert into public."Users" (id, full_name, email, phone_number, country, city)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'city'
  );

  -- Insert into Offices if role is OFFICE
  if new.raw_user_meta_data ->> 'role' = 'OFFICE' then
    insert into public."Offices" (id, office_name, email, phone_number, country, city, is_active)
    values (
      new.id,
      new.raw_user_meta_data ->> 'name',
      new.email,
      coalesce(new.raw_user_meta_data ->> 'phone', ''),
      new.raw_user_meta_data ->> 'country',
      new.raw_user_meta_data ->> 'city',
      false
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

NOTIFY pgrst, 'reload schema';
