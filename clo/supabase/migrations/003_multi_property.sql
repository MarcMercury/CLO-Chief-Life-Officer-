-- ============================================
-- MULTI-PROPERTY SUPPORT MIGRATION
-- Allows users to have multiple homes/properties
-- and link inventory, subscriptions, vendors to specific properties
-- ============================================

-- 1. Create properties table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text DEFAULT '🏠',
  address text,
  city text,
  state text,
  zip text,
  type text DEFAULT 'home' CHECK (type IN ('home', 'vacation', 'rental', 'office', 'storage', 'vehicle', 'other')),
  is_primary boolean DEFAULT false,
  photo_url text,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists and recreate
DROP POLICY IF EXISTS "Users can manage their properties" ON public.properties;
CREATE POLICY "Users can manage their properties"
  ON public.properties FOR ALL
  USING (auth.uid() = user_id);

-- 2. Add property_id to home_inventory
ALTER TABLE public.home_inventory 
ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL;

-- 3. Add property_id to subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL;

-- 4. Add property_id to vendors
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL;

-- 5. Add property_id to service_logs
ALTER TABLE public.service_logs 
ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL;

-- 6. Add property_id to maintenance_schedules
ALTER TABLE public.maintenance_schedules 
ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL;

-- 7. Add property_id to home_documents
ALTER TABLE public.home_documents 
ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL;

-- 8. Create indexes for property_id columns
CREATE INDEX IF NOT EXISTS home_inventory_property_idx ON public.home_inventory(property_id);
CREATE INDEX IF NOT EXISTS subscriptions_property_idx ON public.subscriptions(property_id);
CREATE INDEX IF NOT EXISTS vendors_property_idx ON public.vendors(property_id);
CREATE INDEX IF NOT EXISTS service_logs_property_idx ON public.service_logs(property_id);
CREATE INDEX IF NOT EXISTS maintenance_property_idx ON public.maintenance_schedules(property_id);
CREATE INDEX IF NOT EXISTS home_documents_property_idx ON public.home_documents(property_id);
CREATE INDEX IF NOT EXISTS properties_user_idx ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS properties_primary_idx ON public.properties(is_primary);

-- 9. Add trigger for updated_at on properties
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 10. Function to get or create default property for a user
CREATE OR REPLACE FUNCTION get_or_create_default_property(user_id_param uuid)
RETURNS uuid AS $$
DECLARE
  property_id uuid;
BEGIN
  -- Check if user has a primary property
  SELECT id INTO property_id
  FROM public.properties
  WHERE user_id = user_id_param AND is_primary = true
  LIMIT 1;
  
  -- If no primary, check for any property
  IF property_id IS NULL THEN
    SELECT id INTO property_id
    FROM public.properties
    WHERE user_id = user_id_param
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;
  
  -- If still no property, create a default one
  IF property_id IS NULL THEN
    INSERT INTO public.properties (user_id, name, icon, is_primary, type)
    VALUES (user_id_param, 'My Home', '🏠', true, 'home')
    RETURNING id INTO property_id;
  END IF;
  
  RETURN property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Function to set a property as primary (unsets others)
CREATE OR REPLACE FUNCTION set_property_as_primary(property_id_param uuid)
RETURNS boolean AS $$
DECLARE
  owner_id uuid;
BEGIN
  -- Get the owner of this property
  SELECT user_id INTO owner_id
  FROM public.properties
  WHERE id = property_id_param;
  
  IF owner_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Unset all other properties as primary for this user
  UPDATE public.properties
  SET is_primary = false
  WHERE user_id = owner_id AND is_primary = true;
  
  -- Set the specified property as primary
  UPDATE public.properties
  SET is_primary = true
  WHERE id = property_id_param;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
