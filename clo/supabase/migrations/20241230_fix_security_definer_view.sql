-- Migration: Fix SECURITY DEFINER warning on items_with_circles view
-- This view was incorrectly using SECURITY DEFINER behavior (owner = postgres)
-- which bypasses RLS policies of the querying user.
-- We recreate it with security_invoker = true to enforce RLS properly.

-- Drop the existing view
DROP VIEW IF EXISTS public.items_with_circles;

-- Recreate with security_invoker = true (respects caller's RLS policies)
CREATE OR REPLACE VIEW public.items_with_circles 
WITH (security_invoker = true) AS
SELECT 
  i.*,
  array_agg(ic.circle) as circles
FROM public.items i
LEFT JOIN public.item_circles ic ON i.id = ic.item_id
GROUP BY i.id;

-- Grant access to authenticated users
GRANT SELECT ON public.items_with_circles TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW public.items_with_circles IS 'View joining items with their circles. Uses security_invoker to respect RLS.';
