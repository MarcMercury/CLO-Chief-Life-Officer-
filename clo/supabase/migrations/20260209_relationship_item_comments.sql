-- ============================================
-- RELATIONSHIP ITEM COMMENTS
-- Adds the comments table referenced by useRelationshipItems hook
-- ============================================

-- Create comments table for relationship items
create table if not exists public.relationship_item_comments (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.relationship_items(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.relationship_item_comments enable row level security;

-- Users can view/manage comments for items in their capsules
create policy "Users can view comments for their capsule items"
  on public.relationship_item_comments for select
  using (
    exists (
      select 1 from public.relationship_items ri
      join public.relationship_capsules c on c.id = ri.capsule_id
      where ri.id = relationship_item_comments.item_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

create policy "Users can insert comments for their capsule items"
  on public.relationship_item_comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.relationship_items ri
      join public.relationship_capsules c on c.id = ri.capsule_id
      where ri.id = relationship_item_comments.item_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

create policy "Users can delete their own comments"
  on public.relationship_item_comments for delete
  using (auth.uid() = user_id);

-- Index for performance
create index if not exists idx_rel_item_comments_item on public.relationship_item_comments(item_id);
create index if not exists idx_rel_item_comments_created on public.relationship_item_comments(created_at);

-- ============================================
-- HOUSEHOLD WIKI TABLE
-- Persists wiki entries to database instead of local state
-- ============================================

create table if not exists public.household_wiki (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid,
  category text not null,
  title text not null,
  content text not null,
  is_pinned boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.household_wiki enable row level security;

create policy "Users can manage their wiki entries"
  on public.household_wiki for all
  using (auth.uid() = user_id);

-- Index
create index if not exists idx_wiki_user on public.household_wiki(user_id);
create index if not exists idx_wiki_category on public.household_wiki(category);

-- Trigger for updated_at
create trigger update_household_wiki_updated_at
  before update on public.household_wiki
  for each row execute procedure update_updated_at_column();

-- ============================================
-- FIX: Add missing updated_at trigger for relationship_items
-- ============================================
drop trigger if exists update_relationship_items_updated_at on public.relationship_items;
create trigger update_relationship_items_updated_at
  before update on public.relationship_items
  for each row execute procedure update_updated_at_column();

-- Enable realtime for relationship_items
alter publication supabase_realtime add table public.relationship_items;
