-- =====================================================================
-- Ordine manuale dei corsi (drag & drop in admin).
-- Un solo ordine globale: vale per catalogo, categorie e anteprima in home.
-- I corsi esistenti partono dall'ordine di oggi (in evidenza, poi i più recenti).
-- Da eseguire PRIMA di pubblicare il codice che legge la colonna.
-- =====================================================================
alter table public.courses add column sort_order integer not null default 0;

update public.courses c
set sort_order = ranked.position
from (
  select id, row_number() over (order by is_featured desc, created_at desc) as position
  from public.courses
) ranked
where ranked.id = c.id;

create index courses_sort_order_idx on public.courses (sort_order);
