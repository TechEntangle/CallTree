-- Simple profile RLS without recursion
-- Migration 10: Simple Profile RLS

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Users can always select own profile" ON profiles;
DROP POLICY IF EXISTS "view_own_profile" ON profiles;
DROP POLICY IF EXISTS "view_org_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_view_pending" ON profiles;

-- Drop the function
DROP FUNCTION IF EXISTS get_user_org_id();
DROP FUNCTION IF EXISTS auth.user_profile();
DROP FUNCTION IF EXISTS public.get_current_user_profile();

-- Create a function that returns user info without triggering RLS
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
  user_id uuid,
  org_id uuid,
  user_role text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id, organization_id, role::text
  FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Simple policy: Users can always view their own profile
CREATE POLICY "view_own_profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy: View profiles in same organization
CREATE POLICY "view_org_profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND organization_id IN (
      SELECT org_id FROM public.get_current_user_profile()
    )
  );

-- Policy: Admins can view pending users (no organization)
CREATE POLICY "admins_view_pending"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NULL
    AND 'admin' IN (
      SELECT user_role FROM public.get_current_user_profile()
    )
  );
