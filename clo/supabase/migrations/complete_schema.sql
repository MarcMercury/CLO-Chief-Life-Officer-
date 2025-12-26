-- CLO Database Schema
-- This SQL creates the complete database structure for the Chief Life Officer app

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES (Extends Supabase Auth)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  bio_metric_preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================
-- 2. CIRCLES (The Core Enum)
-- ============================================
create type circle_type as enum ('SELF', 'RELATIONSHIPS', 'HOME');

-- ============================================
-- 3. ITEMS (The Universal "Everything" Table)
-- ============================================
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  item_type text not null, -- 'TASK', 'NOTE', 'EVENT', 'MEMORY'
  status text default 'PENDING',
  due_date timestamp with time zone,
  external_source text, -- e.g., 'G_CALENDAR', 'ALEXA', 'APPLE_HEALTH'
  external_id text, -- ID from the external system to prevent duplicates
  metadata jsonb default '{}'::jsonb, -- Flexible storage for specific integration data
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  -- Ensure external IDs are unique per user/source combination
  unique(user_id, external_source, external_id)
);

-- Enable RLS
alter table public.items enable row level security;

-- Policies for items
create policy "Users can only see their own items"
  on public.items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own items"
  on public.items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own items"
  on public.items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own items"
  on public.items for delete
  using (auth.uid() = user_id);

-- ============================================
-- 4. ITEM_CIRCLES (Many-to-Many Relationship)
-- ============================================
create table public.item_circles (
  item_id uuid references public.items(id) on delete cascade not null,
  circle circle_type not null,
  created_at timestamp with time zone default now() not null,
  primary key (item_id, circle)
);

-- Enable RLS
alter table public.item_circles enable row level security;

-- Policies for item_circles
create policy "Users can view item circles for their items"
  on public.item_circles for select
  using (
    exists (
      select 1 from public.items
      where items.id = item_circles.item_id
      and items.user_id = auth.uid()
    )
  );

create policy "Users can insert item circles for their items"
  on public.item_circles for insert
  with check (
    exists (
      select 1 from public.items
      where items.id = item_circles.item_id
      and items.user_id = auth.uid()
    )
  );

create policy "Users can delete item circles for their items"
  on public.item_circles for delete
  using (
    exists (
      select 1 from public.items
      where items.id = item_circles.item_id
      and items.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. RELATIONSHIPS (The People)
-- ============================================
create table public.relationships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  contact_name text not null,
  contact_avatar text,
  contact_email text,
  contact_phone text,
  last_interaction timestamp with time zone,
  rhythm_frequency_days int default 14, -- Contact every 14 days by default
  is_pinned boolean default false,
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.relationships enable row level security;

-- Policies for relationships
create policy "Users can view own relationships"
  on public.relationships for select
  using (auth.uid() = user_id);

create policy "Users can insert own relationships"
  on public.relationships for insert
  with check (auth.uid() = user_id);

create policy "Users can update own relationships"
  on public.relationships for update
  using (auth.uid() = user_id);

create policy "Users can delete own relationships"
  on public.relationships for delete
  using (auth.uid() = user_id);

-- ============================================
-- 6. INTEGRATIONS (The "Pulse" Config)
-- ============================================
create table public.integrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider text not null, -- 'PLAID', 'SPOTIFY', 'GOOGLE', 'OURA', 'APPLE_HEALTH'
  access_token text, -- MUST BE ENCRYPTED (use pgcrypto in production)
  refresh_token text, -- MUST BE ENCRYPTED
  token_expires_at timestamp with time zone,
  is_active boolean default true,
  last_synced_at timestamp with time zone,
  config jsonb default '{}'::jsonb, -- Provider-specific configuration
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  -- Ensure one integration per provider per user
  unique(user_id, provider)
);

-- Enable RLS
alter table public.integrations enable row level security;

-- Policies for integrations
create policy "Users can view own integrations"
  on public.integrations for select
  using (auth.uid() = user_id);

create policy "Users can insert own integrations"
  on public.integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own integrations"
  on public.integrations for update
  using (auth.uid() = user_id);

create policy "Users can delete own integrations"
  on public.integrations for delete
  using (auth.uid() = user_id);

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================

-- Items indexes
create index items_user_id_idx on public.items(user_id);
create index items_created_at_idx on public.items(created_at desc);
create index items_due_date_idx on public.items(due_date) where due_date is not null;
create index items_status_idx on public.items(status);
create index items_external_source_idx on public.items(external_source) where external_source is not null;

-- Item circles indexes
create index item_circles_circle_idx on public.item_circles(circle);

-- Relationships indexes
create index relationships_user_id_idx on public.relationships(user_id);
create index relationships_last_interaction_idx on public.relationships(last_interaction);
create index relationships_is_pinned_idx on public.relationships(is_pinned) where is_pinned = true;

-- Integrations indexes
create index integrations_user_id_idx on public.integrations(user_id);
create index integrations_provider_idx on public.integrations(provider);
create index integrations_is_active_idx on public.integrations(is_active) where is_active = true;

-- ============================================
-- 8. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply update trigger to all tables
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure update_updated_at_column();

create trigger update_items_updated_at before update on public.items
  for each row execute procedure update_updated_at_column();

create trigger update_relationships_updated_at before update on public.relationships
  for each row execute procedure update_updated_at_column();

create trigger update_integrations_updated_at before update on public.integrations
  for each row execute procedure update_updated_at_column();

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auto-creating profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 9. USEFUL VIEWS
-- ============================================

-- View for items with their circles
create or replace view items_with_circles as
select 
  i.*,
  array_agg(ic.circle) as circles
from public.items i
left join public.item_circles ic on i.id = ic.item_id
group by i.id;

-- Grant access to authenticated users only
alter view items_with_circles owner to postgres;
grant select on items_with_circles to authenticated;

-- ============================================
-- 10. COMMENTS FOR DOCUMENTATION
-- ============================================

comment on table public.profiles is 'User profiles extending Supabase Auth';
comment on table public.items is 'Universal table for tasks, notes, events, and memories';
comment on table public.item_circles is 'Junction table linking items to circles (SELF, RELATIONSHIPS, HOME)';
comment on table public.relationships is 'Personal relationships and contact management';
comment on table public.integrations is 'External service integrations for The Pulse';

comment on column public.items.metadata is 'JSONB field for flexible integration-specific data';
comment on column public.integrations.config is 'Provider-specific configuration and preferences';
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
-- ============================================
-- CLO HOME MANAGEMENT SCHEMA (HomeOS / CHO Dashboard)
-- The "Chief Household Officer" Module
-- ============================================

-- This file extends the base schema with Home management functionality
-- Run this AFTER the main schema.sql

-- Enable fuzzy search extension
create extension if not exists pg_trgm;

-- ============================================
-- 1. HOUSEHOLD PROFILE (Extends User Profile)
-- ============================================
alter table public.profiles 
add column if not exists household_name text, -- e.g. "The Miller Residence"
add column if not exists home_address jsonb default '{}'::jsonb, -- { street, city, state, zip }
add column if not exists home_photo_url text;

-- ============================================
-- 2. INVENTORY (The "Asset" Register)
-- Track all household items with warranty/manual info
-- ============================================
create table public.home_inventory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_name text not null,
  brand text,
  model_number text,
  serial_number text,
  purchase_date date,
  purchase_price numeric,
  warranty_months int, -- AI enriched
  warranty_expiration date,
  manual_url text, -- Link to PDF in Supabase Storage or external
  receipt_url text, -- Link to image in Supabase Storage
  product_image_url text,
  barcode text,
  category text, -- 'Kitchen', 'Garage', 'Living Room', 'HVAC', 'Appliances'
  location text, -- 'Master Bathroom', 'Garage'
  support_phone text, -- AI enriched
  maintenance_schedule text, -- AI enriched: "Change filter every 30 days"
  condition text default 'GOOD', -- 'NEW', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'REPLACED'
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.home_inventory enable row level security;

create policy "Users can manage their inventory"
  on public.home_inventory for all
  using (auth.uid() = user_id);

-- ============================================
-- 3. SUBSCRIPTIONS (Recurring Expenses)
-- The "Kill Switch" for money leaks
-- ============================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  service_name text not null, -- Netflix, Gym, Lawn Care
  service_logo_url text,
  cost numeric not null,
  billing_cycle text not null, -- 'weekly', 'monthly', 'quarterly', 'yearly'
  next_billing_date date,
  last_billed_date date,
  payment_method text, -- 'Visa ending 4242'
  category text, -- 'Entertainment', 'Utilities', 'Health', 'SaaS'
  cancellation_method text, -- AI populates: "Call 555...", "Click here..."
  cancellation_instructions text, -- Detailed steps
  last_drafted_letter text, -- The actual email body generated by AI
  account_identifier text, -- Account number or email
  status text default 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'CANCELLED', 'TRIAL'
  trial_ends_at date,
  importance text default 'OPTIONAL', -- 'ESSENTIAL', 'USEFUL', 'OPTIONAL', 'UNUSED'
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.subscriptions enable row level security;

create policy "Users can manage their subscriptions"
  on public.subscriptions for all
  using (auth.uid() = user_id);

-- ============================================
-- 4. VENDORS (The "Rolodex")
-- Contractors, service providers, handymen
-- ============================================
create table public.vendors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company_name text not null,
  contact_person text,
  phone text,
  email text,
  website text,
  trade text not null, -- 'Plumber', 'Roofer', 'HVAC', 'Electrician', 'Landscaper'
  license_number text,
  insurance_verified boolean default false,
  rating int check (rating >= 1 and rating <= 5), -- 1-5 stars
  last_service_date date,
  total_spent numeric default 0, -- Calculated from service_logs
  is_preferred boolean default false, -- "Go-to" vendor for this trade
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.vendors enable row level security;

create policy "Users can manage their vendors"
  on public.vendors for all
  using (auth.uid() = user_id);

-- ============================================
-- 5. SERVICE LOGS (History of Work)
-- Track all repairs, maintenance, visits
-- ============================================
create table public.service_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  vendor_id uuid references public.vendors(id) on delete set null,
  inventory_id uuid references public.home_inventory(id) on delete set null, -- Optional link
  cost numeric,
  service_date date not null,
  description text not null,
  service_type text, -- 'REPAIR', 'MAINTENANCE', 'INSTALLATION', 'INSPECTION'
  receipt_url text,
  warranty_on_work_months int, -- Warranty for this specific service
  notes text,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.service_logs enable row level security;

create policy "Users can manage their service logs"
  on public.service_logs for all
  using (auth.uid() = user_id);

-- ============================================
-- 6. MAINTENANCE SCHEDULES
-- Recurring maintenance reminders
-- ============================================
create table public.maintenance_schedules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  inventory_id uuid references public.home_inventory(id) on delete cascade,
  title text not null, -- "Change HVAC Filter"
  description text,
  frequency_days int not null, -- Every X days
  last_completed_at timestamp with time zone,
  next_due_at timestamp with time zone not null,
  is_active boolean default true,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.maintenance_schedules enable row level security;

create policy "Users can manage their maintenance schedules"
  on public.maintenance_schedules for all
  using (auth.uid() = user_id);

-- ============================================
-- 7. HOME DOCUMENTS
-- Store important home documents (deeds, insurance, etc.)
-- ============================================
create table public.home_documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  document_type text not null, -- 'DEED', 'INSURANCE', 'MORTGAGE', 'HOA', 'TAX', 'WARRANTY', 'OTHER'
  title text not null,
  description text,
  file_url text not null,
  file_size_bytes int,
  expiration_date date, -- For insurance policies, etc.
  renewal_reminder_days int default 30,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.home_documents enable row level security;

create policy "Users can manage their home documents"
  on public.home_documents for all
  using (auth.uid() = user_id);

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================
create index home_inventory_user_idx on public.home_inventory(user_id);
create index home_inventory_category_idx on public.home_inventory(category);
create index home_inventory_barcode_idx on public.home_inventory(barcode);
create index subscriptions_user_idx on public.subscriptions(user_id);
create index subscriptions_next_billing_idx on public.subscriptions(next_billing_date);
create index subscriptions_status_idx on public.subscriptions(status);
create index vendors_user_idx on public.vendors(user_id);
create index vendors_trade_idx on public.vendors(trade);
create index service_logs_user_idx on public.service_logs(user_id);
create index service_logs_vendor_idx on public.service_logs(vendor_id);
create index service_logs_date_idx on public.service_logs(service_date desc);
create index maintenance_next_due_idx on public.maintenance_schedules(next_due_at);

-- Trigram indexes for fuzzy search
create index vendors_name_trgm_idx on public.vendors using gin (company_name gin_trgm_ops);
create index vendors_trade_trgm_idx on public.vendors using gin (trade gin_trgm_ops);
create index service_logs_desc_trgm_idx on public.service_logs using gin (description gin_trgm_ops);

-- ============================================
-- 9. TRIGGERS
-- ============================================
create trigger update_home_inventory_updated_at 
  before update on public.home_inventory
  for each row execute procedure update_updated_at_column();

create trigger update_subscriptions_updated_at 
  before update on public.subscriptions
  for each row execute procedure update_updated_at_column();

create trigger update_vendors_updated_at 
  before update on public.vendors
  for each row execute procedure update_updated_at_column();

-- Update vendor total_spent when service_log is added
create or replace function update_vendor_total_spent()
returns trigger as $$
begin
  if new.vendor_id is not null then
    update public.vendors
    set 
      total_spent = (
        select coalesce(sum(cost), 0) 
        from public.service_logs 
        where vendor_id = new.vendor_id
      ),
      last_service_date = new.service_date
    where id = new.vendor_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger update_vendor_totals
  after insert on public.service_logs
  for each row execute procedure update_vendor_total_spent();

-- ============================================
-- 10. SEARCH FUNCTION (The "Vendor Memory")
-- Fuzzy search across vendors AND service history
-- ============================================
create or replace function search_vendors(search_term text, user_id_param uuid)
returns table (
  vendor_id uuid,
  company_name text,
  trade text,
  phone text,
  last_service_date date,
  total_spent numeric,
  match_reason text
) 
language plpgsql
as $$
begin
  return query
  select distinct
    v.id,
    v.company_name,
    v.trade,
    v.phone,
    v.last_service_date,
    v.total_spent,
    case
      when v.company_name ilike '%' || search_term || '%' then 'Matched Name'
      when v.trade ilike '%' || search_term || '%' then 'Matched Trade'
      else 'Matched History: ' || (
        select left(description, 50) || '...' 
        from service_logs s 
        where s.vendor_id = v.id 
        and s.description ilike '%' || search_term || '%' 
        limit 1
      )
    end as match_reason
  from
    vendors v
  left join
    service_logs s on v.id = s.vendor_id
  where
    v.user_id = user_id_param
    and (
      v.company_name ilike '%' || search_term || '%'
      or v.trade ilike '%' || search_term || '%'
      or s.description ilike '%' || search_term || '%'
    )
  order by v.last_service_date desc nulls last;
end;
$$;

-- ============================================
-- 11. DASHBOARD FUNCTIONS
-- ============================================

-- Get upcoming alerts (warranties, bills, maintenance)
create or replace function get_home_alerts(user_id_param uuid)
returns jsonb as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'expiring_warranties', (
      select jsonb_agg(jsonb_build_object(
        'id', id,
        'product_name', product_name,
        'warranty_expiration', warranty_expiration,
        'days_remaining', warranty_expiration - current_date
      ))
      from public.home_inventory
      where user_id = user_id_param
      and warranty_expiration is not null
      and warranty_expiration between current_date and current_date + 30
    ),
    'upcoming_bills', (
      select jsonb_agg(jsonb_build_object(
        'id', id,
        'service_name', service_name,
        'cost', cost,
        'next_billing_date', next_billing_date
      ))
      from public.subscriptions
      where user_id = user_id_param
      and status = 'ACTIVE'
      and next_billing_date between current_date and current_date + 7
    ),
    'overdue_maintenance', (
      select jsonb_agg(jsonb_build_object(
        'id', id,
        'title', title,
        'next_due_at', next_due_at,
        'days_overdue', current_date - next_due_at::date
      ))
      from public.maintenance_schedules
      where user_id = user_id_param
      and is_active = true
      and next_due_at < now()
    ),
    'monthly_subscription_cost', (
      select coalesce(sum(
        case billing_cycle
          when 'weekly' then cost * 4
          when 'monthly' then cost
          when 'quarterly' then cost / 3
          when 'yearly' then cost / 12
          else cost
        end
      ), 0)
      from public.subscriptions
      where user_id = user_id_param
      and status = 'ACTIVE'
    )
  ) into result;
  
  return result;
end;
$$ language plpgsql security definer;
