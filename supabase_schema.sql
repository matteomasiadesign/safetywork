-- =========================================================================
-- MIGRATION SCRIPT SUPABASE PER SAFETY WORK S.R.L.S.
-- Esegui questo script nel Supabase SQL Editor per generare le tabelle
-- e configurare le policies per il sito e il pannello amministratore.
-- =========================================================================

-- 1. Tabella Corsi
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL,
  content TEXT NOT NULL,
  duration_hours NUMERIC DEFAULT 8,
  mode TEXT DEFAULT 'Aula in presenza',
  validity_years NUMERIC DEFAULT 5,
  normative_ref TEXT NOT NULL,
  target_audience TEXT,
  certification_issued TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_open_for_enrollment BOOLEAN DEFAULT true,
  seats_available NUMERIC DEFAULT 6,
  image_url TEXT,
  period TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabella Servizi
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  law TEXT NOT NULL,
  image TEXT,
  description TEXT NOT NULL,
  deliverables JSONB DEFAULT '[]'::jsonb,
  icon_name TEXT DEFAULT 'ShieldAlert',
  badge_color TEXT DEFAULT 'cyan',
  display_order NUMERIC DEFAULT 1,
  link TEXT DEFAULT '/#contatti',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabella Richieste dal Sito e Prenotazioni Corsi
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'contatto', -- 'contatto' | 'corso' | 'preventivo'
  client_type TEXT DEFAULT 'privato', -- 'privato' | 'azienda'
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service_type TEXT,
  course_title TEXT,
  course_slug TEXT,
  participants_count NUMERIC DEFAULT 1,
  preferred_mode TEXT,
  message TEXT,
  -- Dati fiscali e fatturazione
  first_name TEXT,
  last_name TEXT,
  fiscal_code TEXT,
  vat_number TEXT,
  ateco_code TEXT,
  sdi_code TEXT,
  pec TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  -- Gestione interna
  status TEXT DEFAULT 'nuovo', -- 'nuovo' | 'contattato' | 'confermato' | 'archiviato'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Abilita Row Level Security (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 5. Politiche di Lettura Pubblica (Tutti possono visualizzare corsi e servizi)
CREATE POLICY "Allow public read courses" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Allow public read services" ON public.services
  FOR SELECT USING (true);

-- Permette a chiunque (anonimi o autenticati) di inviare richieste di contatto e prenotazioni
CREATE POLICY "Allow public insert contact_inquiries" ON public.contact_inquiries
  FOR INSERT WITH CHECK (true);

-- 6. Politiche di Amministrazione per Utenti Autenticati (Amministratori)
CREATE POLICY "Allow authenticated insert courses" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update courses" ON public.courses
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete courses" ON public.courses
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert services" ON public.services
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update services" ON public.services
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete services" ON public.services
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read contact_inquiries" ON public.contact_inquiries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update contact_inquiries" ON public.contact_inquiries
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete contact_inquiries" ON public.contact_inquiries
  FOR DELETE TO authenticated USING (true);

-- 7. Configurazione Storage Bucket per Immagini
INSERT INTO storage.buckets (id, name, public)
VALUES ('safety-assets', 'safety-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Storage Assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'safety-assets');

CREATE POLICY "Authenticated Upload Assets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'safety-assets');
