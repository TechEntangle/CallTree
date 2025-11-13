-- Fix UPDATE policies for profiles (no recursion)
-- Migration 11: Fix Profile UPDATE RLS

-- Drop existing UPDATE policies
DROP POLICY IF EXISTS "Admins can update org profiles" ON profiles;
DROP POLICY IF EXISTS "admins_update_org_profiles" ON profiles;

-- Policy: Admins can update profiles in their organization
CREATE POLICY "admins_update_org_profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Admin check
    'admin' IN (
      SELECT user_role FROM public.get_current_user_profile()
    )
    -- And target profile is in same org OR is pending (null org)
    AND (
      organization_id IN (
        SELECT org_id FROM public.get_current_user_profile()
      )
      OR organization_id IS NULL
    )
  )
  WITH CHECK (
    -- Admin check
    'admin' IN (
      SELECT user_role FROM public.get_current_user_profile()
    )
    -- Target profile must be in same org after update
    AND (
      organization_id IN (
        SELECT org_id FROM public.get_current_user_profile()
      )
      OR organization_id IS NULL
    )
  );

