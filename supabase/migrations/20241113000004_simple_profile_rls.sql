-- Simplified Profile RLS Policy
-- Remove infinite recursion by simplifying to just own profile access

-- Drop all existing SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;

-- Create simple policy: Users can only view their own profile by auth.uid()
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- For viewing other profiles in organization, we'll add that later
-- after the user has been created and has an organization_id
-- For now, keep it simple to avoid recursion

