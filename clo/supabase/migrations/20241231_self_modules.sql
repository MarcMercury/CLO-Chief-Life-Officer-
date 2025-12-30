-- ============================================
-- Self Module Schema Updates
-- Health Goals, Skill Tracker, Mood Logs, etc.
-- ============================================

-- Health Goals (Physical Module - % Tracker)
CREATE TABLE IF NOT EXISTS health_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  unit TEXT NOT NULL, -- 'oz', 'steps', 'minutes', etc.
  goal_type TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
  resets_at TIMESTAMPTZ, -- When the goal resets (for daily goals, midnight)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill Tracker (Mental Module - Learn List)
CREATE TABLE IF NOT EXISTS skill_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT, -- 'language', 'programming', 'music', 'fitness', etc.
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  last_practiced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Read List (Mental Module)
CREATE TABLE IF NOT EXISTS read_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  status TEXT DEFAULT 'to_read', -- 'to_read', 'reading', 'completed'
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood Logs (Emotional Module - Russell's Circumplex)
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  energy_level INTEGER NOT NULL CHECK (energy_level >= -2 AND energy_level <= 2), -- -2 to 2 scale
  pleasure_level INTEGER NOT NULL CHECK (pleasure_level >= -2 AND pleasure_level <= 2), -- -2 to 2 scale
  emotion_label TEXT, -- 'anxious', 'excited', 'calm', 'sad', etc.
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gratitude Log (Emotional Module)
CREATE TABLE IF NOT EXISTS gratitude_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  logged_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Career Goals (Professional Module)
CREATE TABLE IF NOT EXISTS career_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  target_date DATE,
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Networking Outreach (Professional Module)
CREATE TABLE IF NOT EXISTS networking_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_info TEXT, -- phone, email, or social handle
  contacted BOOLEAN DEFAULT FALSE,
  outreach_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idea Vault (Professional Module)
CREATE TABLE IF NOT EXISTS idea_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_title TEXT NOT NULL,
  idea_content TEXT,
  category TEXT, -- 'business', 'product', 'content', etc.
  color TEXT DEFAULT 'yellow', -- sticky note color
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Tracking (Practical Module)
CREATE TABLE IF NOT EXISTS daily_spending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT,
  description TEXT,
  spend_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_budget DECIMAL(10,2),
  weekly_budget DECIMAL(10,2),
  monthly_budget DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Daily 3 Intentions (replaces the simple daily goals)
CREATE TABLE IF NOT EXISTS daily_intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intention_text TEXT NOT NULL,
  slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 3),
  is_completed BOOLEAN DEFAULT FALSE,
  intention_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slot_number, intention_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_goals_user ON health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_tracker_user ON skill_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_gratitude_log_user_date ON gratitude_log(user_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_networking_daily_user_date ON networking_daily(user_id, outreach_date);
CREATE INDEX IF NOT EXISTS idx_daily_spending_user_date ON daily_spending(user_id, spend_date);
CREATE INDEX IF NOT EXISTS idx_daily_intentions_user_date ON daily_intentions(user_id, intention_date);

-- Enable RLS
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gratitude_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE networking_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_spending ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_intentions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can manage own health_goals" ON health_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own skill_tracker" ON skill_tracker FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own read_list" ON read_list FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mood_logs" ON mood_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own gratitude_log" ON gratitude_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own career_goals" ON career_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own networking_daily" ON networking_daily FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own idea_vault" ON idea_vault FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily_spending" ON daily_spending FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budget_settings" ON budget_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily_intentions" ON daily_intentions FOR ALL USING (auth.uid() = user_id);
