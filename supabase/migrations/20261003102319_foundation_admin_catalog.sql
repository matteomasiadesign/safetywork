-- =====================================================================
-- Safety Work - fondamenta: ruolo admin, catalogo (categorie, corsi, servizi), storage immagini
-- Applicata al progetto Supabase come migrazione "foundation_admin_catalog".
-- =====================================================================

-- Trigger generico per updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Admin: elenco degli utenti autorizzati al pannello.
-- Si popola SOLO da dashboard/SQL; nessuna scrittura dai client.
-- ---------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

-- Un utente puo' leggere solo la propria riga (serve a is_admin()).
create policy "admin_users: lettura riga propria"
  on public.admin_users for select
  to authenticated
  using (user_id = (select auth.uid()));

-- is_admin() NON e' security definer: si appoggia alla policy sopra.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- Categorie
-- ---------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(btrim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Corsi
-- (date/posti delle singole edizioni arriveranno in una tabella dedicata)
-- ---------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  title text not null check (length(btrim(title)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text not null default '',
  content text not null default '',
  duration_hours numeric(5,1) not null default 8 check (duration_hours > 0),
  mode text not null default 'Aula in presenza',
  validity_years integer check (validity_years is null or validity_years > 0),
  normative_ref text not null default '',
  target_audience text,
  certification_issued text,
  location text,
  image_url text,
  is_featured boolean not null default false,
  is_open_for_enrollment boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_category_id_idx on public.courses (category_id);
create index courses_published_featured_idx on public.courses (is_published, is_featured);

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Servizi
-- ---------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (length(btrim(code)) > 0),
  title text not null check (length(btrim(title)) > 0),
  law text not null default '',
  description text not null default '',
  deliverables jsonb not null default '[]'::jsonb check (jsonb_typeof(deliverables) = 'array'),
  image_url text,
  icon_name text not null default 'ShieldAlert',
  badge_color text not null default 'cyan' check (badge_color in ('cyan', 'orange', 'red')),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RLS + grants del catalogo
-- Pubblico: legge solo contenuti pubblicati. Admin: tutto.
-- ---------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.courses    enable row level security;
alter table public.services   enable row level security;

revoke all on public.categories, public.courses, public.services from anon, authenticated;
grant select on public.categories, public.courses, public.services to anon, authenticated;
grant insert, update, delete on public.categories, public.courses, public.services to authenticated;

-- categorie: lettura pubblica (sono solo etichette)
create policy "categories: lettura pubblica"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "categories: admin inserisce"
  on public.categories for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "categories: admin modifica"
  on public.categories for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "categories: admin elimina"
  on public.categories for delete
  to authenticated
  using ((select public.is_admin()));

-- corsi
create policy "courses: pubblico vede i pubblicati"
  on public.courses for select
  to anon
  using (is_published);

create policy "courses: admin vede tutto"
  on public.courses for select
  to authenticated
  using (is_published or (select public.is_admin()));

create policy "courses: admin inserisce"
  on public.courses for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "courses: admin modifica"
  on public.courses for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "courses: admin elimina"
  on public.courses for delete
  to authenticated
  using ((select public.is_admin()));

-- servizi
create policy "services: pubblico vede i pubblicati"
  on public.services for select
  to anon
  using (is_published);

create policy "services: admin vede tutto"
  on public.services for select
  to authenticated
  using (is_published or (select public.is_admin()));

create policy "services: admin inserisce"
  on public.services for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "services: admin modifica"
  on public.services for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "services: admin elimina"
  on public.services for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- Storage: immagini del sito (bucket pubblico in lettura, scrittura solo admin)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "site-images: admin carica"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images' and (select public.is_admin()));

create policy "site-images: admin sostituisce"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()))
  with check (bucket_id = 'site-images' and (select public.is_admin()));

create policy "site-images: admin elimina"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()));
