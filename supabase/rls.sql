-- Cierra el acceso público a las tablas de la app.
-- El backend (lib/supabase.ts) usa SUPABASE_SECRET_KEY, que bypassa RLS,
-- así que no se necesitan políticas: con RLS activado y sin policies,
-- la publishable key (anon) queda sin acceso de lectura/escritura.

alter table admins        enable row level security;
alter table customers     enable row level security;
alter table loyalty_cards enable row level security;
alter table settings      enable row level security;
