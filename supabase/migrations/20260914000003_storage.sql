-- Purchase image storage.
-- Source of truth: docs/DATA_MODEL.md §25, CLAUDE.md §21
--
-- Bucket: purchase-images (private)
-- Object path: <user_id>/<purchase_id>/image
--
-- The bucket is private so images are only readable by their owner
-- (via the authenticated client or signed URLs). purchases.image_url stores
-- the object path inside this bucket.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'purchase-images',
  'purchase-images',
  false,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

-- The first path segment must be the caller's user id.

create policy "Users can view their own purchase images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'purchase-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can upload their own purchase images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'purchase-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update their own purchase images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'purchase-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'purchase-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own purchase images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'purchase-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
