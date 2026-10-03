-- =====================================================================
-- Contenuti modificabili del sito (testi e immagini), editati da /admin.
-- Una riga per campo: se la riga manca il sito usa il testo originale scritto nel codice.
-- Applicata al progetto Supabase come migrazione "site_content".
-- =====================================================================
create table public.site_content (
  key text primary key check (key ~ '^[a-z0-9_.-]+$' and length(key) <= 100),
  value text not null check (length(value) <= 5000),
  updated_at timestamptz not null default now()
);

create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

revoke all on public.site_content from anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

-- lettura pubblica: sono i testi gia' visibili sul sito
create policy "site_content: lettura pubblica"
  on public.site_content for select
  to anon, authenticated
  using (true);

create policy "site_content: admin inserisce"
  on public.site_content for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "site_content: admin modifica"
  on public.site_content for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "site_content: admin elimina"
  on public.site_content for delete
  to authenticated
  using ((select public.is_admin()));
