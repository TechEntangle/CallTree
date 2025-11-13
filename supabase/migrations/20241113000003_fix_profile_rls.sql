-- Fix Profile RLS Policy
-- Allow users to check their own profile even if they don't have one yet

-- Drop the existing policy that causes circular dependency
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;

-- Create new policy: Users can always view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Create separate policy: Users can view other profiles in their organization
CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (
    organization_id IS NOT NULL 
    AND organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

