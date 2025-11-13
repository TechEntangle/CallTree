-- Allow admins to view pending users (users without organization)
-- Migration 08: Allow Pending Users View

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;

-- Create new policy that allows:
-- 1. Users to view profiles in their organization
-- 2. Admins to view profiles without an organization (pending users)
CREATE POLICY "Users can view org profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- View profiles in same organization
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
    OR
    -- Admins can view pending users (no organization)
    (
      organization_id IS NULL
      AND EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
          AND role = 'admin'
      )
    )
  );

