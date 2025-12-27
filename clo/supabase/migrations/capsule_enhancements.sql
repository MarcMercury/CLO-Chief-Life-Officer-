-- ============================================
-- CAPSULE ENHANCEMENTS
-- Adds: Invite Codes, Plan/Decide/Resolve, Double-Consent Vault
-- ============================================

-- 1. INVITE CODES (6-character alphanumeric)
alter table public.relationship_capsules 
  add column if not exists invite_code text unique,
  add column if not exists relationship_type text default 'partner'; -- 'partner', 'friend', 'family'

-- Function to generate 6-char invite code
create or replace function generate_invite_code()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- No confusing chars (0,O,1,I)
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- Trigger to auto-generate invite code on capsule creation
create or replace function set_invite_code()
returns trigger as $$
begin
  if NEW.invite_code is null then
    NEW.invite_code := generate_invite_code();
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists set_capsule_invite_code on public.relationship_capsules;
create trigger set_capsule_invite_code
  before insert on public.relationship_capsules
  for each row execute function set_invite_code();

-- Function to join capsule via invite code
create or replace function join_capsule_by_code(code text)
returns jsonb as $$
declare
  capsule_record record;
begin
  -- Find pending capsule with this code
  select * into capsule_record
  from public.relationship_capsules
  where invite_code = upper(code)
    and status = 'PENDING'
    and user_b_id is null;
  
  if capsule_record is null then
    return jsonb_build_object('success', false, 'error', 'Invalid or expired code');
  end if;
  
  -- Check user isn't trying to join their own capsule
  if capsule_record.user_a_id = auth.uid() then
    return jsonb_build_object('success', false, 'error', 'Cannot join your own capsule');
  end if;
  
  -- Update capsule with new member
  update public.relationship_capsules
  set user_b_id = auth.uid(),
      status = 'ACTIVE',
      updated_at = now()
  where id = capsule_record.id;
  
  return jsonb_build_object(
    'success', true, 
    'capsule_id', capsule_record.id,
    'relationship_type', capsule_record.relationship_type
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- 2. PLANNING PIPELINE (Plan → Decide → Resolve)
-- ============================================

-- Plan Items (Brainstorming Sandbox)
create table if not exists public.plan_items (
  id uuid default uuid_generate_v4() primary key,
  capsule_id uuid references public.relationship_capsules(id) on delete cascade not null,
  title text not null,
  description text,
  category text default 'general', -- 'date', 'trip', 'purchase', 'activity', 'general'
  created_by uuid references public.profiles(id) not null,
  vote_a boolean, -- User A's vote (null = no vote, true = yes, false = no)
  vote_b boolean, -- User B's vote
  status text default 'planning', -- 'planning', 'promoted', 'archived'
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.plan_items enable row level security;

create policy "Users can manage plan items in their capsules"
  on public.plan_items for all
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = plan_items.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- Decide Items (Promoted from Plan for final decision)
create table if not exists public.decide_items (
  id uuid default uuid_generate_v4() primary key,
  capsule_id uuid references public.relationship_capsules(id) on delete cascade not null,
  plan_item_id uuid references public.plan_items(id),
  title text not null,
  description text,
  option_a text, -- First option
  option_b text, -- Second option (for This/That decisions)
  choice_user_a text, -- User A's choice
  choice_user_b text, -- User B's choice
  final_decision text, -- The agreed-upon decision
  scheduled_date timestamp with time zone, -- When to do it
  status text default 'pending', -- 'pending', 'decided', 'completed', 'cancelled'
  decided_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

alter table public.decide_items enable row level security;

create policy "Users can manage decide items in their capsules"
  on public.decide_items for all
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = decide_items.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- Resolve Items (Conflict Resolution)
create table if not exists public.resolve_items (
  id uuid default uuid_generate_v4() primary key,
  capsule_id uuid references public.relationship_capsules(id) on delete cascade not null,
  issue text not null, -- What's the issue
  initiated_by uuid references public.profiles(id) not null,
  
  -- User A's perspective
  feeling_a text, -- "I feel..."
  need_a text, -- "I need..."
  willing_a text, -- "I am willing to..."
  compromise_a text, -- Proposed compromise
  accepted_a boolean default false,
  
  -- User B's perspective
  feeling_b text,
  need_b text,
  willing_b text,
  compromise_b text,
  accepted_b boolean default false,
  
  -- Resolution
  final_resolution text, -- The agreed compromise
  status text default 'open', -- 'open', 'in_progress', 'resolved', 'stale'
  created_at timestamp with time zone default now() not null,
  resolved_at timestamp with time zone
);

alter table public.resolve_items enable row level security;

create policy "Users can manage resolve items in their capsules"
  on public.resolve_items for all
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = resolve_items.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- ============================================
-- 3. DOUBLE-CONSENT VAULT
-- ============================================

-- Add approval columns to vault_items
alter table public.vault_items
  add column if not exists approved_by_uploader boolean default false,
  add column if not exists approved_by_partner boolean default false,
  add column if not exists status text default 'pending'; -- 'pending', 'visible', 'rejected'

-- Function to approve vault item
create or replace function approve_vault_item(item_id uuid)
returns jsonb as $$
declare
  item_record record;
  capsule_record record;
  is_uploader boolean;
begin
  -- Get item and capsule
  select v.*, c.user_a_id, c.user_b_id 
  into item_record
  from public.vault_items v
  join public.relationship_capsules c on c.id = v.capsule_id
  where v.id = item_id;
  
  if item_record is null then
    return jsonb_build_object('success', false, 'error', 'Item not found');
  end if;
  
  -- Check user is part of capsule
  if auth.uid() != item_record.user_a_id and auth.uid() != item_record.user_b_id then
    return jsonb_build_object('success', false, 'error', 'Access denied');
  end if;
  
  -- Determine if user is uploader
  is_uploader := (auth.uid() = item_record.uploaded_by);
  
  -- Update appropriate approval
  if is_uploader then
    update public.vault_items
    set approved_by_uploader = true,
        status = case when approved_by_partner then 'visible' else 'pending' end
    where id = item_id;
  else
    update public.vault_items
    set approved_by_partner = true,
        status = case when approved_by_uploader then 'visible' else 'pending' end
    where id = item_id;
  end if;
  
  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;

-- ============================================
-- 4. INDEXES
-- ============================================
create index if not exists plan_items_capsule_idx on public.plan_items(capsule_id);
create index if not exists decide_items_capsule_idx on public.decide_items(capsule_id);
create index if not exists resolve_items_capsule_idx on public.resolve_items(capsule_id);
create index if not exists capsules_invite_code_idx on public.relationship_capsules(invite_code);

-- ============================================
-- 5. REALTIME
-- ============================================
alter publication supabase_realtime add table public.plan_items;
alter publication supabase_realtime add table public.decide_items;
alter publication supabase_realtime add table public.resolve_items;
