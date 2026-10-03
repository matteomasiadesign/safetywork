-- =====================================================================
-- Richieste dal sito (contatti, iscrizioni ai corsi, preventivi)
-- Il pubblico puo' solo INSERIRE; lettura/gestione solo admin.
-- Applicata al progetto Supabase come migrazione "inquiries".
-- =====================================================================
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),

  kind text not null default 'contatto'
    check (kind in ('contatto', 'corso', 'preventivo')),
  status text not null default 'nuovo'
    check (status in ('nuovo', 'contattato', 'preventivo_inviato', 'confermato', 'non_interessato', 'archiviato')),
  client_type text check (client_type in ('privato', 'azienda')),

  -- contatto
  name text not null check (length(btrim(name)) between 1 and 200),
  email text not null check (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or length(phone) <= 40),
  company text check (company is null or length(company) <= 200),

  -- oggetto della richiesta
  service_type text check (service_type is null or length(service_type) <= 200),
  course_id uuid references public.courses (id) on delete set null,
  course_title text check (course_title is null or length(course_title) <= 300),
  course_slug text check (course_slug is null or length(course_slug) <= 200),
  participants_count integer not null default 1 check (participants_count between 1 and 500),
  preferred_mode text check (preferred_mode is null or length(preferred_mode) <= 100),
  message text check (message is null or length(message) <= 5000),

  -- anagrafica e fatturazione (solo iscrizioni)
  first_name text check (first_name is null or length(first_name) <= 100),
  last_name text check (last_name is null or length(last_name) <= 100),
  fiscal_code text check (fiscal_code is null or length(fiscal_code) <= 20),
  birth_date date,
  birth_place text check (birth_place is null or length(birth_place) <= 100),
  vat_number text check (vat_number is null or length(vat_number) <= 20),
  ateco_code text check (ateco_code is null or length(ateco_code) <= 20),
  sdi_code text check (sdi_code is null or length(sdi_code) <= 7),
  pec text check (pec is null or length(pec) <= 254),
  address text check (address is null or length(address) <= 200),
  city text check (city is null or length(city) <= 100),
  postal_code text check (postal_code is null or length(postal_code) <= 10),

  -- consenso privacy (registrato al momento dell'invio)
  privacy_accepted_at timestamptz not null default now(),
  privacy_policy_version text not null default '1',

  -- gestione interna
  notes text check (notes is null or length(notes) <= 5000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_created_at_idx on public.inquiries (created_at desc);
create index inquiries_status_idx on public.inquiries (status);
create index inquiries_course_id_idx on public.inquiries (course_id);

create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

alter table public.inquiries enable row level security;

revoke all on public.inquiries from anon, authenticated;
grant insert on public.inquiries to anon, authenticated;
grant select, update, delete on public.inquiries to authenticated;

-- Chiunque puo' inviare una richiesta, ma solo "nuova" e senza note interne.
create policy "inquiries: invio pubblico"
  on public.inquiries for insert
  to anon, authenticated
  with check (status = 'nuovo' and notes is null);

create policy "inquiries: admin legge"
  on public.inquiries for select
  to authenticated
  using ((select public.is_admin()));

create policy "inquiries: admin modifica"
  on public.inquiries for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "inquiries: admin elimina"
  on public.inquiries for delete
  to authenticated
  using ((select public.is_admin()));
