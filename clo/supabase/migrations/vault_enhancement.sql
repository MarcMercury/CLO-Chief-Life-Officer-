-- ============================================
-- CLO VAULT ENHANCEMENT MIGRATION
-- Adds per-user passcode tracking and file support
-- ============================================

-- ============================================
-- 1. VAULT USER SETUP (Per-User Passcode Tracking)
-- Tracks which users have set up their vault passcode
-- ============================================
create table if not exists public.vault_user_setup (
  id uuid default uuid_generate_v4() primary key,
  capsule_id uuid references public.relationship_capsules(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  setup_at timestamp with time zone default now() not null,
  
  -- Unique constraint: one setup record per user per capsule
  unique(capsule_id, user_id)
);

-- Enable RLS
alter table public.vault_user_setup enable row level security;

-- Users can view setup status for their capsules
create policy "Users can view vault setup for their capsules"
  on public.vault_user_setup for select
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = vault_user_setup.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- Users can insert their own setup record
create policy "Users can record their vault setup"
  on public.vault_user_setup for insert
  with check (auth.uid() = user_id);

-- ============================================
-- 2. ENHANCE VAULT_ITEMS TABLE
-- Add file support columns
-- ============================================

-- Add new columns to vault_items if they don't exist
do $$
begin
  -- File storage columns
  if not exists (select 1 from information_schema.columns 
    where table_name = 'vault_items' and column_name = 'file_url') then
    alter table public.vault_items add column file_url text;
  end if;
  
  if not exists (select 1 from information_schema.columns 
    where table_name = 'vault_items' and column_name = 'file_name') then
    alter table public.vault_items add column file_name text;
  end if;
  
  if not exists (select 1 from information_schema.columns 
    where table_name = 'vault_items' and column_name = 'file_size') then
    alter table public.vault_items add column file_size bigint;
  end if;
  
  if not exists (select 1 from information_schema.columns 
    where table_name = 'vault_items' and column_name = 'thumbnail_url') then
    alter table public.vault_items add column thumbnail_url text;
  end if;
  
  -- Approval workflow columns
  if not exists (select 1 from information_schema.columns 
    where table_name = 'vault_items' and column_name = 'approved_by_uploader') then
    alter table public.vault_items add column approved_by_uploader boolean default true;
  end if;
  
  if not exists (select 1 from information_schema.columns 
    where table_name = 'vault_items' and column_name = 'approved_by_partner') then
    alter table public.vault_items add column approved_by_partner boolean default false;
  end if;
  
  -- Item type (more granular than content_type)
  if not exists (select 1 from information_schema.columns 
    where table_name = 'vault_items' and column_name = 'item_type') then
    alter table public.vault_items add column item_type text default 'note';
  end if;
  
  -- Encryption IV for client-side encryption
  if not exists (select 1 from information_schema.columns 
    where table_name = 'vault_items' and column_name = 'encryption_iv') then
    alter table public.vault_items add column encryption_iv text;
  end if;
  
  -- Rename uploaded_by to created_by for consistency (if needed)
  if exists (select 1 from information_schema.columns 
    where table_name = 'vault_items' and column_name = 'uploaded_by') 
    and not exists (select 1 from information_schema.columns 
    where table_name = 'vault_items' and column_name = 'created_by') then
    alter table public.vault_items rename column uploaded_by to created_by;
  end if;
end$$;

-- ============================================
-- 3. STORAGE BUCKET FOR VAULT FILES
-- Create if not exists (run in Supabase dashboard or via admin)
-- ============================================
-- Note: Storage bucket creation requires admin access
-- Run this in Supabase dashboard SQL editor:
--
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- values (
--   'vault-files',
--   'vault-files',
--   false, -- Private bucket
--   52428800, -- 50MB limit per file
--   array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 
--         'application/pdf', 'application/msword', 
--         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
--         'text/plain', 'application/json']
-- );
--
-- Storage policies for vault-files bucket:
-- 
-- create policy "Users can upload to their capsule folders"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'vault-files' and
--     exists (
--       select 1 from public.relationship_capsules c
--       where c.id::text = (storage.foldername(name))[1]
--       and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
--     )
--   );
--
-- create policy "Users can view their capsule files"
--   on storage.objects for select
--   using (
--     bucket_id = 'vault-files' and
--     exists (
--       select 1 from public.relationship_capsules c
--       where c.id::text = (storage.foldername(name))[1]
--       and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
--     )
--   );
--
-- create policy "Users can delete their capsule files"
--   on storage.objects for delete
--   using (
--     bucket_id = 'vault-files' and
--     exists (
--       select 1 from public.relationship_capsules c
--       where c.id::text = (storage.foldername(name))[1]
--       and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
--     )
--   );

-- ============================================
-- 4. INDEXES FOR NEW COLUMNS
-- ============================================
create index if not exists vault_user_setup_capsule_idx on public.vault_user_setup(capsule_id);
create index if not exists vault_user_setup_user_idx on public.vault_user_setup(user_id);
create index if not exists vault_items_approval_idx on public.vault_items(approved_by_uploader, approved_by_partner);
