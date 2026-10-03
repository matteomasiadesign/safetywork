-- Il browser comprime ogni foto sotto i 150 KB prima del caricamento (WebP, con ripiego JPEG).
-- Il limite viene applicato anche dal bucket, cosi' nessun caricamento puo' aggirarlo.
-- Applicata al progetto Supabase come migrazione "storage_images_limit_150kb".
update storage.buckets
set file_size_limit = 153600,
    allowed_mime_types = array['image/webp', 'image/jpeg']
where id = 'site-images';
