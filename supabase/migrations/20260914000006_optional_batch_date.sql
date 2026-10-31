-- Make batch_date optional on batches so users can create or edit a batch
-- without selecting a date.

alter table public.batches
  alter column batch_date drop not null;
