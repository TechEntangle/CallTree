-- Fix infinite recursion in profile RLS policy
-- Migration 09: Fix Profile RLS Recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Users can always select own profile" ON profiles;

-- Allow users to always view their own profile (no recursion)
CREATE POLICY "Users can always select own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow users to view profiles in their organization
-- Uses a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$;

CREATE POLICY "Users can view org profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- View profiles in same organization
    organization_id = get_user_org_id()
    -- Allow admins to view pending users
    OR (
      organization_id IS NULL
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
        LIMIT 1
      )
    )
  );

