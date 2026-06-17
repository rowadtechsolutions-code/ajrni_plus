-- BookingRequests: main request from users
create table if not exists public."BookingRequests" (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  country text null,
  city text null,
  car_type text null,
  brand text null,
  model text null,
  pickup_date date null,
  return_date date null,
  budget_per_day numeric null,
  notes text null,
  status text null default 'pending',
  created_at timestamp with time zone null default now(),
  full_name text null,
  phone_number text null,
  constraint BookingRequests_pkey primary key (id),
  constraint BookingRequests_user_id_fkey foreign key (user_id) references auth.users (id)
);

-- BookingRequestOffices: distribution of each request to offices
create table if not exists public."BookingRequestOffices" (
  id uuid not null default gen_random_uuid(),
  request_id uuid not null,
  office_id uuid not null,
  status text null default 'sent',
  created_at timestamp with time zone null default now(),
  constraint BookingRequestOffices_pkey primary key (id),
  constraint BookingRequestOffices_office_id_fkey foreign key (office_id) references "Offices" (id),
  constraint BookingRequestOffices_request_id_fkey foreign key (request_id) references "BookingRequests" (id) on delete cascade
);

-- BookingOffers: offers from offices
create table if not exists public."BookingOffers" (
  id uuid not null default gen_random_uuid(),
  request_id uuid not null,
  office_id uuid not null,
  car_name text null,
  car_model text null,
  price_per_day numeric null,
  total_price numeric null,
  notes text null,
  status text null default 'pending',
  created_at timestamp with time zone null default now(),
  constraint BookingOffers_pkey primary key (id),
  constraint BookingOffers_office_id_fkey foreign key (office_id) references "Offices" (id),
  constraint BookingOffers_request_id_fkey foreign key (request_id) references "BookingRequests" (id) on delete cascade
);

-- RLS: allow authenticated users to insert their own requests
alter table public."BookingRequests" enable row level security;
alter table public."BookingRequestOffices" enable row level security;
alter table public."BookingOffers" enable row level security;

create policy "Users can insert own requests" on public."BookingRequests" for insert with check (auth.uid() = user_id);
create policy "Users can view own requests" on public."BookingRequests" for select using (auth.uid() = user_id);
create policy "Users can view own request offices" on public."BookingRequestOffices" for select using (true);
create policy "Users can view offers on their requests" on public."BookingOffers" for select using (true);
create policy "Offices can view their assigned requests" on public."BookingRequestOffices" for select using (office_id in (select id from public."Offices" where id = auth.uid()));
create policy "Offices can insert offers" on public."BookingOffers" for insert with check (office_id in (select id from public."Offices" where id = auth.uid()));
create policy "Offices can update own offers" on public."BookingOffers" for update using (office_id in (select id from public."Offices" where id = auth.uid()));
create policy "Offices can view own offers" on public."BookingOffers" for select using (office_id in (select id from public."Offices" where id = auth.uid()));
