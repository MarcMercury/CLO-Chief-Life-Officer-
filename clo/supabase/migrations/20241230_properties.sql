-- Properties Migration
-- Adds support for multiple home/property entities per user

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏠',
  address TEXT,
  type TEXT DEFAULT 'home' CHECK (type IN ('home', 'vacation', 'rental', 'office', 'storage', 'vehicle', 'other')),
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add property_id to existing HomeOS tables
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE service_logs ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE maintenance_schedules ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_property_id ON inventory(property_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_property_id ON subscriptions(property_id);
CREATE INDEX IF NOT EXISTS idx_vendors_property_id ON vendors(property_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_property_id ON service_logs(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_property_id ON maintenance_schedules(property_id);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create default property for new users
CREATE OR REPLACE FUNCTION create_default_property()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO properties (user_id, name, icon, is_primary, type)
  VALUES (NEW.id, 'Main House', '🏠', true, 'home');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default property on user signup
DROP TRIGGER IF EXISTS on_user_created_property ON auth.users;
CREATE TRIGGER on_user_created_property
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_property();

-- Updated_at trigger for properties
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_updated_at ON properties;
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_properties_updated_at();

-- Comment
COMMENT ON TABLE properties IS 'User properties/homes for HomeOS module';
