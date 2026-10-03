-- =====================================================================
-- Agenda operativa: corsi, sopralluoghi, scadenze, consulenze, appuntamenti.
-- Dati interni: nessun accesso pubblico, solo admin.
-- Applicata al progetto Supabase come migrazione "agenda_events".
-- =====================================================================
create table public.agenda_events (
  id uuid primary key default gen_random_uuid(),

  title text not null check (length(btrim(title)) between 1 and 300),
  description text check (description is null or length(description) <= 5000),
  event_type text not null default 'appuntamento'
    check (event_type in ('corso', 'sopralluogo', 'scadenza', 'consulenza', 'appuntamento', 'altro')),
  custom_type text check (custom_type is null or length(custom_type) <= 100),
  status text not null default 'programmato'
    check (status in ('programmato', 'confermato', 'completato', 'annullato')),

  start_date date not null,
  end_date date,
  start_time time,
  end_time time,

  location text check (location is null or length(location) <= 300),
  instructor text check (instructor is null or length(instructor) <= 200),
  max_participants integer check (max_participants is null or max_participants between 1 and 1000),
  notes text check (notes is null or length(notes) <= 5000),

  -- collegamenti (se l'elemento collegato viene eliminato il collegamento si azzera,
  -- i dati del cliente restano nell'impegno)
  course_id uuid references public.courses (id) on delete set null,
  inquiry_id uuid references public.inquiries (id) on delete set null,
  client_name text check (client_name is null or length(client_name) <= 200),
  client_company text check (client_company is null or length(client_company) <= 200),
  client_phone text check (client_phone is null or length(client_phone) <= 40),
  client_email text check (client_email is null or length(client_email) <= 254),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint agenda_events_dates_ok check (end_date is null or end_date >= start_date),
  constraint agenda_events_times_ok check (
    start_time is null
    or end_time is null
    or coalesce(end_date, start_date) > start_date
    or end_time > start_time
  )
);

create index agenda_events_start_date_idx on public.agenda_events (start_date);
create index agenda_events_course_id_idx on public.agenda_events (course_id);
create index agenda_events_inquiry_id_idx on public.agenda_events (inquiry_id);

create trigger agenda_events_set_updated_at
  before update on public.agenda_events
  for each row execute function public.set_updated_at();

alter table public.agenda_events enable row level security;

revoke all on public.agenda_events from anon, authenticated;
grant select, insert, update, delete on public.agenda_events to authenticated;

create policy "agenda_events: admin legge"
  on public.agenda_events for select
  to authenticated
  using ((select public.is_admin()));

create policy "agenda_events: admin inserisce"
  on public.agenda_events for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "agenda_events: admin modifica"
  on public.agenda_events for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "agenda_events: admin elimina"
  on public.agenda_events for delete
  to authenticated
  using ((select public.is_admin()));
