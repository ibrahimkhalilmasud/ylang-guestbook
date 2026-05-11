create extension if not exists "pgcrypto";

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  whatsapp_number text not null,
  email text not null unique,
  country text not null,
  nationality text not null,
  preferred_language text not null,
  date_of_birth date,
  anniversary date,
  passport text,
  dietary_preferences text,
  room_preferences text,
  special_notes text,
  vip_status boolean not null default false,
  tags text[] not null default '{}',
  total_visits integer not null default 0,
  total_nights integer not null default 0,
  lifetime_spend numeric not null default 0,
  last_stay date,
  created_at timestamptz not null default now()
);

create table if not exists stays (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  arrival_date date not null,
  departure_date date not null,
  villa_room text not null,
  booking_source text not null,
  travel_agent text,
  total_spend numeric not null default 0,
  created_at timestamptz not null default now(),
  constraint valid_stay_dates check (departure_date >= arrival_date)
);

create table if not exists message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null check (channel in ('email', 'whatsapp')),
  occasion text not null check (occasion in ('Eid Mubarak', 'Christmas', 'New Year', 'birthday', 'anniversary')),
  subject text,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists seasonal_greetings (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  template_id uuid not null references message_templates(id) on delete cascade,
  send_at timestamptz not null,
  channel text not null check (channel in ('email', 'whatsapp')),
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'sent')),
  created_at timestamptz not null default now()
);

create index if not exists idx_guests_search_name on guests using gin (to_tsvector('simple', full_name));
create index if not exists idx_guests_nationality on guests(nationality);
create index if not exists idx_guests_vip on guests(vip_status);
create index if not exists idx_stays_guest on stays(guest_id);
create index if not exists idx_stays_arrival on stays(arrival_date);
