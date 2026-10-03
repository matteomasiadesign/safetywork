-- =====================================================================
-- Date e sedi dei corsi (edizioni) + modalità normalizzata.
-- L'azienda fa da intermediario con gli enti erogatori: non si gestiscono posti,
-- ma si pubblica quando e dove si svolge il corso e in che modalità (presenza/online/misto).
-- Applicata al progetto Supabase come migrazione "course_editions".
-- =====================================================================

-- Modalità: tre soli valori, uguali in tutto il sito.
update public.courses
set mode = case
  when mode in ('Videoconferenza sincrona', 'E-learning (FAD)') then 'online'
  when mode in ('Aula / Videoconferenza sincrona', 'Misto (Blended)') then 'misto'
  else 'presenza'
end;

alter table public.courses alter column mode set default 'presenza';
alter table public.courses
  add constraint courses_mode_check check (mode in ('presenza', 'online', 'misto'));

-- ---------------------------------------------------------------------
-- Edizioni: una riga per ogni data in cui il corso si svolge
-- ---------------------------------------------------------------------
create table public.course_editions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  start_date date not null,
  end_date date,
  location text check (location is null or length(btrim(location)) between 1 and 200),
  notes text check (notes is null or length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_editions_dates_ok check (end_date is null or end_date >= start_date)
);

create index course_editions_course_id_idx on public.course_editions (course_id);
create index course_editions_start_date_idx on public.course_editions (start_date);

create trigger course_editions_set_updated_at
  before update on public.course_editions
  for each row execute function public.set_updated_at();

alter table public.course_editions enable row level security;

revoke all on public.course_editions from anon, authenticated;
grant select on public.course_editions to anon, authenticated;
grant insert, update, delete on public.course_editions to authenticated;

-- Il pubblico vede solo le date dei corsi pubblicati; l'admin vede tutto.
create policy "course_editions: pubblico vede quelle dei corsi pubblicati"
  on public.course_editions for select
  to anon
  using (exists (select 1 from public.courses c where c.id = course_id and c.is_published));

create policy "course_editions: admin vede tutto"
  on public.course_editions for select
  to authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  );

create policy "course_editions: admin inserisce"
  on public.course_editions for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "course_editions: admin modifica"
  on public.course_editions for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "course_editions: admin elimina"
  on public.course_editions for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- Richieste: quale data ha scelto il cliente (con testo salvato, come per il titolo del corso)
-- ---------------------------------------------------------------------
alter table public.inquiries
  add column edition_id uuid references public.course_editions (id) on delete set null,
  add column edition_label text check (edition_label is null or length(edition_label) <= 300);

create index inquiries_edition_id_idx on public.inquiries (edition_id);
