-- ============================================
-- CLO RELATIONSHIP ITEMS UNIFIED SCHEMA
-- Unified workflow: Plan → Resolve → Decisions
-- ============================================

-- This migration creates a unified "relationship_items" table that handles
-- the entire lifecycle of shared planning between two partners.
-- 
-- WORKFLOW:
-- 1. PLAN: Ideas are created, both partners can vote (👍/👎)
-- 2. RESOLVE: If disagreement or complexity, item moves to resolve for discussion
-- 3. DECISIONS: When both agree, item becomes a confirmed decision
--
-- Items can be for: travel, money, shopping, gifts, activities, or any shared decision

-- ============================================
-- 1. RELATIONSHIP ITEMS (Unified Planning Table)
-- ============================================
create table if not exists public.relationship_items (
  id uuid default uuid_generate_v4() primary key,
  capsule_id uuid references public.relationship_capsules(id) on delete cascade not null,
  
  -- Core item data
  title text not null,
  description text,
  category text default 'general', -- 'travel', 'money', 'shopping', 'gift', 'activity', 'date', 'home', 'general'
  
  -- Who created it
  created_by uuid references public.profiles(id) not null,
  
  -- Workflow status
  -- 'planning' - In Plan section, awaiting votes
  -- 'needs_resolve' - Needs discussion/compromise
  -- 'resolving' - In Resolve section, both working on it
  -- 'pending_decision' - Ready for final confirmation
  -- 'confirmed' - Both confirmed, in Decisions as active
  -- 'completed' - Done/accomplished
  -- 'archived' - No longer relevant
  status text default 'planning' check (status in (
    'planning', 'needs_resolve', 'resolving', 
    'pending_decision', 'confirmed', 'completed', 'archived'
  )),
  
  -- Voting in Plan phase
  vote_user_a boolean, -- null = not voted, true = 👍, false = 👎
  vote_user_b boolean,
  
  -- Resolution fields (used when in Resolve)
  -- User A's perspective
  feeling_a text,
  need_a text,
  willing_a text,
  compromise_a text,
  
  -- User B's perspective
  feeling_b text,
  need_b text,
  willing_b text,
  compromise_b text,
  
  -- Final resolution notes
  resolution_notes text,
  
  -- Decision confirmation
  confirmed_by_a boolean default false,
  confirmed_by_b boolean default false,
  confirmed_at timestamp with time zone,
  
  -- Optional fields for specific categories
  estimated_cost decimal(10,2),
  currency text default 'USD',
  scheduled_date date,
  location text,
  priority text default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  
  -- Deadline for decision (optional)
  deadline timestamp with time zone,
  
  -- Tracking
  moved_to_resolve_at timestamp with time zone,
  moved_to_decision_at timestamp with time zone,
  completed_at timestamp with time zone,
  
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.relationship_items enable row level security;

-- Policies: Users can only see/modify items for their capsules
create policy "Users can view items for their capsules"
  on public.relationship_items for select
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = relationship_items.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

create policy "Users can insert items for their capsules"
  on public.relationship_items for insert
  with check (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = relationship_items.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
    and auth.uid() = created_by
  );

create policy "Users can update items for their capsules"
  on public.relationship_items for update
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = relationship_items.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

create policy "Users can delete items for their capsules"
  on public.relationship_items for delete
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = relationship_items.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- ============================================
-- 2. ITEM COMMENTS (Discussion Thread)
-- ============================================
create table if not exists public.relationship_item_comments (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.relationship_items(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.relationship_item_comments enable row level security;

create policy "Users can manage comments on their items"
  on public.relationship_item_comments for all
  using (
    exists (
      select 1 from public.relationship_items i
      join public.relationship_capsules c on c.id = i.capsule_id
      where i.id = relationship_item_comments.item_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- ============================================
-- 3. ITEM HISTORY (Audit Trail)
-- ============================================
create table if not exists public.relationship_item_history (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.relationship_items(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  action text not null, -- 'created', 'voted', 'moved_to_resolve', 'submitted_perspective', 'confirmed', 'completed', etc.
  details jsonb, -- Additional context
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.relationship_item_history enable row level security;

create policy "Users can view history for their items"
  on public.relationship_item_history for select
  using (
    exists (
      select 1 from public.relationship_items i
      join public.relationship_capsules c on c.id = i.capsule_id
      where i.id = relationship_item_history.item_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

create policy "Users can insert history for their items"
  on public.relationship_item_history for insert
  with check (
    exists (
      select 1 from public.relationship_items i
      join public.relationship_capsules c on c.id = i.capsule_id
      where i.id = relationship_item_history.item_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================
create index if not exists relationship_items_capsule_idx on public.relationship_items(capsule_id);
create index if not exists relationship_items_status_idx on public.relationship_items(status);
create index if not exists relationship_items_created_idx on public.relationship_items(created_at desc);
create index if not exists relationship_item_comments_item_idx on public.relationship_item_comments(item_id);
create index if not exists relationship_item_history_item_idx on public.relationship_item_history(item_id);

-- ============================================
-- 5. TRIGGERS
-- ============================================

-- Update updated_at timestamp
create or replace function update_relationship_items_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_relationship_items_updated_at
  before update on public.relationship_items
  for each row execute procedure update_relationship_items_timestamp();

-- Auto-advance status based on votes and confirmations
create or replace function check_item_status_advance()
returns trigger as $$
begin
  -- If both voted yes in planning, advance to pending_decision
  if new.status = 'planning' 
     and new.vote_user_a = true 
     and new.vote_user_b = true then
    new.status = 'pending_decision';
    new.moved_to_decision_at = now();
  end if;
  
  -- If both confirmed in pending_decision, advance to confirmed
  if new.status = 'pending_decision' 
     and new.confirmed_by_a = true 
     and new.confirmed_by_b = true then
    new.status = 'confirmed';
    new.confirmed_at = now();
  end if;
  
  return new;
end;
$$ language plpgsql;

create trigger check_item_status_advance_trigger
  before update on public.relationship_items
  for each row execute procedure check_item_status_advance();

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Get pending items count for a capsule
create or replace function get_pending_decisions_count(capsule_id_param uuid)
returns integer as $$
declare
  count integer;
begin
  select count(*)
  into count
  from public.relationship_items
  where capsule_id = capsule_id_param
  and status in ('planning', 'needs_resolve', 'resolving', 'pending_decision');
  
  return count;
end;
$$ language plpgsql security definer;

-- Move item to resolve
create or replace function move_item_to_resolve(item_id_param uuid)
returns public.relationship_items as $$
declare
  result public.relationship_items;
begin
  update public.relationship_items
  set 
    status = 'resolving',
    moved_to_resolve_at = now(),
    updated_at = now()
  where id = item_id_param
  returning * into result;
  
  return result;
end;
$$ language plpgsql security definer;

-- Submit perspective (for resolve flow)
create or replace function submit_resolve_perspective(
  item_id_param uuid,
  is_user_a boolean,
  feeling text,
  need text,
  willing text,
  compromise text
)
returns public.relationship_items as $$
declare
  result public.relationship_items;
begin
  if is_user_a then
    update public.relationship_items
    set 
      feeling_a = feeling,
      need_a = need,
      willing_a = willing,
      compromise_a = compromise,
      updated_at = now()
    where id = item_id_param
    returning * into result;
  else
    update public.relationship_items
    set 
      feeling_b = feeling,
      need_b = need,
      willing_b = willing,
      compromise_b = compromise,
      updated_at = now()
    where id = item_id_param
    returning * into result;
  end if;
  
  return result;
end;
$$ language plpgsql security definer;

-- Move resolved item to decision queue
create or replace function move_item_to_decision(item_id_param uuid, resolution_notes_param text default null)
returns public.relationship_items as $$
declare
  result public.relationship_items;
begin
  update public.relationship_items
  set 
    status = 'pending_decision',
    resolution_notes = coalesce(resolution_notes_param, resolution_notes),
    moved_to_decision_at = now(),
    updated_at = now()
  where id = item_id_param
  returning * into result;
  
  return result;
end;
$$ language plpgsql security definer;

-- Confirm decision
create or replace function confirm_decision(item_id_param uuid, is_user_a boolean)
returns public.relationship_items as $$
declare
  result public.relationship_items;
begin
  if is_user_a then
    update public.relationship_items
    set confirmed_by_a = true, updated_at = now()
    where id = item_id_param
    returning * into result;
  else
    update public.relationship_items
    set confirmed_by_b = true, updated_at = now()
    where id = item_id_param
    returning * into result;
  end if;
  
  return result;
end;
$$ language plpgsql security definer;

-- Mark item as completed
create or replace function complete_item(item_id_param uuid)
returns public.relationship_items as $$
declare
  result public.relationship_items;
begin
  update public.relationship_items
  set 
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  where id = item_id_param
  returning * into result;
  
  return result;
end;
$$ language plpgsql security definer;

-- ============================================
-- 7. REALTIME SUBSCRIPTIONS
-- ============================================
alter publication supabase_realtime add table public.relationship_items;
alter publication supabase_realtime add table public.relationship_item_comments;

-- ============================================
-- 8. VIEWS FOR CONVENIENCE
-- ============================================

-- Items in planning phase
create or replace view public.planning_items as
select * from public.relationship_items
where status = 'planning'
order by created_at desc;

-- Items needing resolution
create or replace view public.resolve_items as
select * from public.relationship_items
where status in ('needs_resolve', 'resolving')
order by moved_to_resolve_at desc nulls last, created_at desc;

-- Pending decisions (awaiting confirmation)
create or replace view public.pending_decisions as
select * from public.relationship_items
where status = 'pending_decision'
order by moved_to_decision_at desc nulls last, created_at desc;

-- Confirmed decisions
create or replace view public.confirmed_decisions as
select * from public.relationship_items
where status = 'confirmed'
order by confirmed_at desc nulls last;

-- Completed items
create or replace view public.completed_items as
select * from public.relationship_items
where status = 'completed'
order by completed_at desc nulls last;
