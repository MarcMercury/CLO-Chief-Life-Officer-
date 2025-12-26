-- ============================================
-- CLO RELATIONSHIP CAPSULE SCHEMA
-- Phase 3.5: The "Two-Player" Relationship Architecture
-- ============================================

-- This file extends the base schema with Relationship Capsule functionality
-- Run this AFTER the main schema.sql

-- ============================================
-- 1. ENHANCED RELATIONSHIPS TABLE (The Binding)
-- Supports both single-user contacts AND two-way Capsules
-- ============================================
create table if not exists public.relationship_capsules (
  id uuid default uuid_generate_v4() primary key,
  user_a_id uuid references public.profiles(id) on delete cascade not null,
  user_b_id uuid references public.profiles(id) on delete set null, -- Nullable if invite pending
  status text default 'PENDING', -- 'ACTIVE', 'PENDING', 'ARCHIVED'
  tier text default 'STANDARD', -- 'INNER_CIRCLE', 'STANDARD', 'ACQUAINTANCE'
  sentiment_score float default 0.5, -- 0.0 to 1.0 (Derived from interactions)
  streak_days int default 0,
  last_deep_connect timestamp with time zone,
  vault_pin_hash text, -- Hashed version of the shared 4-digit PIN
  invite_email text, -- Email of pending invitee
  invite_token uuid default uuid_generate_v4(), -- For magic link invites
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.relationship_capsules enable row level security;

-- Policies: Users can only see capsules they're part of
create policy "Users can view their capsules"
  on public.relationship_capsules for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Users can create capsules"
  on public.relationship_capsules for insert
  with check (auth.uid() = user_a_id);

create policy "Users can update their capsules"
  on public.relationship_capsules for update
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- ============================================
-- 2. INTERACTION LOGS (The "Ingestion Engine")
-- Stores metadata from emails, calls, or manual entries
-- ============================================
create table public.interaction_logs (
  id uuid default uuid_generate_v4() primary key,
  capsule_id uuid references public.relationship_capsules(id) on delete cascade not null,
  logged_by uuid references public.profiles(id) not null,
  source text not null, -- 'MANUAL', 'GMAIL', 'CALENDAR', 'SMS_IMPORT', 'SHARE_EXTENSION'
  interaction_type text not null, -- 'MEETING', 'MESSAGE', 'CALL', 'MEMORY', 'GIFT', 'PHOTO'
  summary text, -- AI-generated summary of the interaction
  sentiment_detected text, -- 'POSITIVE', 'NEUTRAL', 'NEGATIVE', 'URGENT'
  open_loop_detected boolean default false,
  raw_content text, -- Original imported content (if any)
  occurred_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.interaction_logs enable row level security;

create policy "Users can view logs for their capsules"
  on public.interaction_logs for select
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = interaction_logs.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

create policy "Users can insert logs for their capsules"
  on public.interaction_logs for insert
  with check (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = interaction_logs.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- ============================================
-- 3. OPEN LOOPS (The "To-Do" for People)
-- Tracks unresolved commitments
-- ============================================
create table public.open_loops (
  id uuid default uuid_generate_v4() primary key,
  capsule_id uuid references public.relationship_capsules(id) on delete cascade not null,
  description text not null,
  direction text default 'I_OWE', -- 'I_OWE' (I owe them), 'THEY_OWE' (They owe me)
  status text default 'OPEN', -- 'OPEN', 'RESOLVED', 'EXPIRED'
  origin_interaction_id uuid references public.interaction_logs(id),
  due_date timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  resolved_at timestamp with time zone
);

-- Enable RLS
alter table public.open_loops enable row level security;

create policy "Users can manage loops for their capsules"
  on public.open_loops for all
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = open_loops.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- ============================================
-- 4. EMOTIONAL LOGS (The Vibe Check)
-- Daily non-verbal check-ins
-- ============================================
create table public.emotional_logs (
  id uuid default uuid_generate_v4() primary key,
  capsule_id uuid references public.relationship_capsules(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  mood_self text not null, -- Emoji code: '😊', '😔', '🌧️', etc.
  mood_partner text, -- How I feel about them
  mood_relationship text, -- How I feel about "us"
  notes text, -- Optional private reflection
  logged_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.emotional_logs enable row level security;

-- Users can see their own logs, and partner can see mood_self/mood_partner/mood_relationship (not notes)
create policy "Users can view emotional logs"
  on public.emotional_logs for select
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = emotional_logs.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

create policy "Users can insert their own emotional logs"
  on public.emotional_logs for insert
  with check (auth.uid() = user_id);

-- ============================================
-- 5. SHARED TASKS (The Logistics)
-- Synced to-do list for the relationship
-- ============================================
create table public.shared_tasks (
  id uuid default uuid_generate_v4() primary key,
  capsule_id uuid references public.relationship_capsules(id) on delete cascade not null,
  title text not null,
  description text,
  is_completed boolean default false,
  assigned_to uuid references public.profiles(id), -- Optional: assign to specific partner
  due_date timestamp with time zone,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default now() not null,
  completed_at timestamp with time zone
);

-- Enable RLS
alter table public.shared_tasks enable row level security;

create policy "Users can manage shared tasks"
  on public.shared_tasks for all
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = shared_tasks.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- ============================================
-- 6. VAULT ITEMS (Two-Key Security Storage)
-- End-to-end encrypted shared sensitive data
-- ============================================
create table public.vault_items (
  id uuid default uuid_generate_v4() primary key,
  capsule_id uuid references public.relationship_capsules(id) on delete cascade not null,
  content_type text not null, -- 'IMAGE', 'NOTE', 'FILE', 'DOCUMENT'
  title text,
  encrypted_content text not null, -- Must be encrypted client-side before sending
  content_hash text, -- For integrity verification
  uploaded_by uuid references public.profiles(id) not null,
  file_size_bytes int,
  mime_type text,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.vault_items enable row level security;

create policy "Users can manage vault items for their capsules"
  on public.vault_items for all
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = vault_items.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- ============================================
-- 7. CAPSULE MESSAGES (E2EE Chat)
-- Private messaging within a capsule
-- ============================================
create table public.capsule_messages (
  id uuid default uuid_generate_v4() primary key,
  capsule_id uuid references public.relationship_capsules(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  encrypted_content text not null, -- E2EE encrypted message
  message_type text default 'TEXT', -- 'TEXT', 'IMAGE', 'VOICE', 'AI_SUGGESTION'
  is_ai_response boolean default false, -- If this is from @CLO mediator
  reply_to_id uuid references public.capsule_messages(id),
  created_at timestamp with time zone default now() not null,
  read_at timestamp with time zone -- When partner read it
);

-- Enable RLS
alter table public.capsule_messages enable row level security;

create policy "Users can manage messages in their capsules"
  on public.capsule_messages for all
  using (
    exists (
      select 1 from public.relationship_capsules c
      where c.id = capsule_messages.capsule_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================
create index capsules_user_a_idx on public.relationship_capsules(user_a_id);
create index capsules_user_b_idx on public.relationship_capsules(user_b_id);
create index capsules_status_idx on public.relationship_capsules(status);
create index interaction_logs_capsule_idx on public.interaction_logs(capsule_id);
create index interaction_logs_occurred_idx on public.interaction_logs(occurred_at desc);
create index emotional_logs_capsule_idx on public.emotional_logs(capsule_id);
create index emotional_logs_date_idx on public.emotional_logs(logged_at desc);
create index shared_tasks_capsule_idx on public.shared_tasks(capsule_id);
create index capsule_messages_capsule_idx on public.capsule_messages(capsule_id);
create index capsule_messages_created_idx on public.capsule_messages(created_at desc);

-- ============================================
-- 9. TRIGGERS FOR UPDATED_AT
-- ============================================
create trigger update_relationship_capsules_updated_at 
  before update on public.relationship_capsules
  for each row execute procedure update_updated_at_column();

-- ============================================
-- 10. REALTIME SUBSCRIPTIONS
-- Enable realtime for collaborative features
-- ============================================
alter publication supabase_realtime add table public.shared_tasks;
alter publication supabase_realtime add table public.capsule_messages;
alter publication supabase_realtime add table public.emotional_logs;

-- ============================================
-- 11. USEFUL FUNCTIONS
-- ============================================

-- Function to accept a capsule invite
create or replace function accept_capsule_invite(invite_token_param uuid)
returns uuid as $$
declare
  capsule_id uuid;
begin
  update public.relationship_capsules
  set 
    user_b_id = auth.uid(),
    status = 'ACTIVE',
    updated_at = now()
  where invite_token = invite_token_param
    and status = 'PENDING'
    and user_b_id is null
  returning id into capsule_id;
  
  return capsule_id;
end;
$$ language plpgsql security definer;

-- Function to calculate relationship health
create or replace function calculate_relationship_health(capsule_id_param uuid)
returns jsonb as $$
declare
  result jsonb;
  days_since_contact int;
  recent_sentiment float;
  open_loop_count int;
begin
  -- Days since last interaction
  select extract(day from now() - max(occurred_at))
  into days_since_contact
  from public.interaction_logs
  where capsule_id = capsule_id_param;
  
  -- Average sentiment from recent emotional logs
  select avg(
    case mood_relationship
      when '😊' then 1.0
      when '😐' then 0.5
      when '😔' then 0.2
      else 0.5
    end
  )
  into recent_sentiment
  from public.emotional_logs
  where capsule_id = capsule_id_param
  and logged_at > now() - interval '7 days';
  
  -- Open loops count
  select count(*)
  into open_loop_count
  from public.open_loops
  where capsule_id = capsule_id_param
  and status = 'OPEN';
  
  result := jsonb_build_object(
    'days_since_contact', coalesce(days_since_contact, 999),
    'recent_sentiment', coalesce(recent_sentiment, 0.5),
    'open_loops', coalesce(open_loop_count, 0),
    'health_score', case
      when coalesce(days_since_contact, 999) > 30 then 0.2
      when coalesce(days_since_contact, 999) > 14 then 0.5
      else coalesce(recent_sentiment, 0.7)
    end
  );
  
  return result;
end;
$$ language plpgsql security definer;
