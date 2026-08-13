-- Esquema de base de datos para mi-card
-- Generado a partir del uso real en lib/db.ts, lib/loyaltyDb.ts, lib/adminDb.ts, lib/settingsDb.ts
-- Ejecutar en el SQL Editor de Supabase (https://supabase.com/dashboard/project/_/sql/new)

create extension if not exists pgcrypto;

-- ============================================================
-- admins
-- ============================================================
create table if not exists admins (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id text not null default 'default',
  name          text not null,
  password_hash text not null,
  role          text not null default 'Administrador',
  created_at    timestamptz not null default now()
);

create index if not exists admins_restaurant_id_idx on admins (restaurant_id);
create unique index if not exists admins_restaurant_id_name_idx on admins (restaurant_id, lower(name));

-- ============================================================
-- customers
-- ============================================================
create table if not exists customers (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id text not null default 'default',
  name          text not null,
  age           int,
  phone         text not null default '',
  visits        int not null default 0,
  confirmed     boolean not null default false,
  stamps        jsonb not null default '[]'::jsonb,
  password_hash text,
  registered_at timestamptz not null default now(),
  requested_at  timestamptz
);

create index if not exists customers_restaurant_id_idx on customers (restaurant_id);
create index if not exists customers_restaurant_id_name_idx on customers (restaurant_id, lower(name));

-- ============================================================
-- loyalty_cards
-- ============================================================
create table if not exists loyalty_cards (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id text not null default 'default',
  name          text not null,
  phone         text not null default '',
  visits        int not null default 0,
  active        boolean not null default true,
  card_type     text not null default 'cafe',
  stamps        jsonb not null default '[]'::jsonb,
  expires_at    timestamptz,
  registered_at timestamptz not null default now()
);

create index if not exists loyalty_cards_restaurant_id_idx on loyalty_cards (restaurant_id);
create index if not exists loyalty_cards_restaurant_id_phone_idx on loyalty_cards (restaurant_id, phone);

-- ============================================================
-- settings (clave-valor, con prefijo "<restaurant_id>:" ya incluido en key)
-- ============================================================
create table if not exists settings (
  key   text primary key,
  value text not null default ''
);

-- ============================================================
-- Storage bucket usado por app/api/settings/upload/route.ts
-- ============================================================
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;
