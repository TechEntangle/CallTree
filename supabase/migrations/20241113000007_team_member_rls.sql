-- Allow team member management
-- Migration 07: Team Member RLS Policies

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update org profiles" ON profiles;

-- Allow users to view profiles in their organization
CREATE POLICY "Users can view org profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Allow admins to update profiles in their organization
CREATE POLICY "Admins can update org profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- User must be admin in the same organization
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE id = auth.uid() 
        AND role = 'admin'
        AND organization_id = profiles.organization_id
    )
  )
  WITH CHECK (
    -- User must be admin in the same organization
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE id = auth.uid() 
        AND role = 'admin'
        AND organization_id = profiles.organization_id
    )
  );

