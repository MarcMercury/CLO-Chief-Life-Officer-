-- Migration: Fix function search_path security warnings
-- All functions should have an immutable search_path to prevent search_path injection attacks

-- 1. Fix create_default_property
CREATE OR REPLACE FUNCTION public.create_default_property()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.properties (user_id, name, is_primary, icon, type)
  VALUES (NEW.id, 'Main House', true, '🏠', 'home')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. Fix update_properties_updated_at
CREATE OR REPLACE FUNCTION public.update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 3. Fix update_vendor_total_spent
CREATE OR REPLACE FUNCTION public.update_vendor_total_spent()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.vendors 
  SET total_spent = (
    SELECT COALESCE(SUM(cost), 0) 
    FROM public.service_logs 
    WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id)
  )
  WHERE id = COALESCE(NEW.vendor_id, OLD.vendor_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 4. Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 5. Fix handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 6. Fix accept_capsule_invite
CREATE OR REPLACE FUNCTION public.accept_capsule_invite(invite_code_param TEXT)
RETURNS UUID AS $$
DECLARE
  v_capsule_id UUID;
  v_inviter_id UUID;
BEGIN
  -- Find the capsule with this invite code
  SELECT id, created_by INTO v_capsule_id, v_inviter_id
  FROM public.capsules 
  WHERE invite_code = invite_code_param
    AND status = 'pending';
  
  IF v_capsule_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;
  
  -- Update the capsule with the partner
  UPDATE public.capsules
  SET partner_id = auth.uid(),
      status = 'active',
      invite_code = NULL
  WHERE id = v_capsule_id;
  
  RETURN v_capsule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 7. Fix calculate_relationship_health
CREATE OR REPLACE FUNCTION public.calculate_relationship_health(capsule_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  health_score INTEGER := 50;
  recent_pulses INTEGER;
  recent_signals INTEGER;
  last_pulse_days INTEGER;
BEGIN
  -- Count pulses in last 7 days
  SELECT COUNT(*) INTO recent_pulses
  FROM public.pulse_check_ins
  WHERE capsule_id = capsule_uuid
    AND created_at > NOW() - INTERVAL '7 days';
  
  -- Count signals in last 7 days  
  SELECT COUNT(*) INTO recent_signals
  FROM public.capsule_signals
  WHERE capsule_id = capsule_uuid
    AND created_at > NOW() - INTERVAL '7 days';
  
  -- Days since last pulse
  SELECT EXTRACT(DAY FROM NOW() - MAX(created_at))::INTEGER INTO last_pulse_days
  FROM public.pulse_check_ins
  WHERE capsule_id = capsule_uuid;
  
  -- Calculate score
  health_score := health_score + (recent_pulses * 5);
  health_score := health_score + (recent_signals * 2);
  
  IF last_pulse_days IS NOT NULL AND last_pulse_days > 3 THEN
    health_score := health_score - (last_pulse_days * 3);
  END IF;
  
  -- Clamp between 0 and 100
  RETURN GREATEST(0, LEAST(100, health_score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 8. Fix search_vendors
CREATE OR REPLACE FUNCTION public.search_vendors(search_term TEXT)
RETURNS SETOF public.vendors AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.vendors
  WHERE user_id = auth.uid()
    AND (
      name ILIKE '%' || search_term || '%'
      OR trade ILIKE '%' || search_term || '%'
      OR notes ILIKE '%' || search_term || '%'
    )
  ORDER BY rating DESC NULLS LAST, name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 9. Fix get_home_alerts
CREATE OR REPLACE FUNCTION public.get_home_alerts()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'expiring_warranties', (
      SELECT json_agg(row_to_json(i))
      FROM (
        SELECT id, name, warranty_expiration
        FROM public.home_inventory
        WHERE user_id = auth.uid()
          AND warranty_expiration IS NOT NULL
          AND warranty_expiration BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        ORDER BY warranty_expiration
        LIMIT 5
      ) i
    ),
    'upcoming_bills', (
      SELECT json_agg(row_to_json(s))
      FROM (
        SELECT id, name, cost, next_billing_date
        FROM public.subscriptions
        WHERE user_id = auth.uid()
          AND is_active = true
          AND next_billing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        ORDER BY next_billing_date
        LIMIT 5
      ) s
    ),
    'overdue_maintenance', (
      SELECT json_agg(row_to_json(m))
      FROM (
        SELECT id, task_name, next_due_date
        FROM public.maintenance_schedules
        WHERE user_id = auth.uid()
          AND next_due_date < CURRENT_DATE
        ORDER BY next_due_date
        LIMIT 5
      ) m
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
