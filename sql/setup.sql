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

-- ========== CARS ==========
create table if not exists public.cars (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default now(),
  name text not null,
  brand text null,
  year integer null,
  color text null,
  fuel_type text null,
  transmission text null,
  seats integer null,
  plate_number text null,
  rental_type text not null default 'daily'::text,
  price_per_day numeric(10,2) not null,
  price_per_month numeric(10,2) null,
  deposit numeric(10,2) null default 0,
  status text null default 'available'::text,
  is_active boolean null default true,
  office_id uuid null,
  owner_id uuid not null,
  image text null,
  constraint cars_pkey primary key (id),
  constraint cars_plate_number_key unique (plate_number),
  constraint cars_office_id_fkey foreign key (office_id) references "Offices" (id) on delete cascade,
  constraint cars_owner_id_fkey foreign key (owner_id) references auth.users (id) on delete cascade
);

alter table public.cars enable row level security;

create policy "Cars readable by all" on public.cars for select using (true);
create policy "Cars insertable by owner" on public.cars for insert with check (owner_id = auth.uid());
create policy "Cars updatable by owner" on public.cars for update using (owner_id = auth.uid());
create policy "Cars deletable by owner" on public.cars for delete using (owner_id = auth.uid());

-- ========== STORAGE (car-images bucket) ==========
insert into storage.buckets (id, name, public)
values ('car-images', 'car-images', true)
on conflict (id) do nothing;

create policy "Car images publicly readable"
  on storage.objects for select
  using (bucket_id = 'car-images');

create policy "Car images uploaded by owner"
  on storage.objects for insert
  with check (bucket_id = 'car-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Car images deletable by owner"
  on storage.objects for delete
  using (bucket_id = 'car-images' and (storage.foldername(name))[1] = auth.uid()::text);

NOTIFY pgrst, 'reload schema';
