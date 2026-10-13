-- =====================================================================
-- Conservazione dei dati (GDPR): le richieste ricevute dal sito vengono cancellate
-- dopo 24 mesi. Il periodo deve coincidere con quello dichiarato in /privacy
-- (INQUIRY_RETENTION_MONTHS in src/config/privacy.ts).
-- Applicata al progetto Supabase dall'SQL Editor il 13 ottobre 2026.
-- =====================================================================
create or replace function public.purge_old_inquiries()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.inquiries
  where created_at < now() - interval '24 months';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Solo il database (cron) la puo' eseguire: mai dal sito.
revoke all on function public.purge_old_inquiries() from public, anon, authenticated;

-- Pulizia automatica ogni notte alle 03:30 (richiede l'estensione pg_cron).
create extension if not exists pg_cron;

select cron.schedule(
  'purge-old-inquiries',
  '30 3 * * *',
  $$select public.purge_old_inquiries()$$
);
