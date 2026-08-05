-- Stable identity makes the reviewed-content importer safe to retry.
alter table public.content_units
  add column reviewed_import_key text;

create unique index content_units_reviewed_import_key_uidx
  on public.content_units (reviewed_import_key)
  where reviewed_import_key is not null;
