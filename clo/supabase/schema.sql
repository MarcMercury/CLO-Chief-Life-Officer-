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
