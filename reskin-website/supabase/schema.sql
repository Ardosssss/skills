-- RE|SKIN – Datenbankschema für Supabase (im SQL-Editor ausführen)
create extension if not exists btree_gist;

create table if not exists settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null
);

create table if not exists treatments (
  id text primary key,
  category text not null check (category in ('beratung','haar','tattoo','kosmetik')),
  grp text,
  name text not null,
  description text,
  duration_min int not null check (duration_min between 5 and 480),
  price numeric(8,2),
  price_package numeric(8,2),
  active boolean not null default true,
  sort int not null default 0
);

create table if not exists blockers (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('ferien','blocker')),
  start_at timestamptz not null,
  end_at timestamptz not null check (end_at > start_at),
  reason text
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  status text not null default 'bestaetigt' check (status in ('bestaetigt','erledigt','no_show','storniert')),
  category text not null,
  items jsonb not null,
  details jsonb not null default '{}'::jsonb,
  photo_key text,
  start_at timestamptz not null,
  end_at timestamptz not null check (end_at > start_at),
  duration_min int not null,
  price_total numeric(8,2),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  note text,
  health jsonb not null default '{}'::jsonb,   -- vertrauliche Gesundheitsangaben
  health_flagged boolean not null default false,
  consent_at timestamptz not null,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  -- Doppelbuchungen auf Datenbankebene verhindern (stornierte Termine ausgenommen)
  constraint bookings_no_overlap exclude using gist (tstzrange(start_at, end_at, '[)') with &&)
    where (status <> 'storniert')
);
create index if not exists bookings_start_idx on bookings (start_at);
create index if not exists bookings_email_idx on bookings (lower(email));

create table if not exists customer_notes (
  email text primary key,
  note text not null default '',
  updated_at timestamptz not null default now()
);

-- Row Level Security: keine öffentlichen Policies → nur der Server (Service Role) hat Zugriff.
alter table settings enable row level security;
alter table treatments enable row level security;
alter table blockers enable row level security;
alter table bookings enable row level security;
alter table customer_notes enable row level security;

-- Privater Speicher für Tattoo-Fotos
insert into storage.buckets (id, name, public)
values ('tattoo-photos', 'tattoo-photos', false)
on conflict (id) do nothing;
