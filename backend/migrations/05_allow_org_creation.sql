-- Allow Organization Creation
-- Users need to be able to create organizations when they sign up

-- Add policy to allow authenticated users to create organizations
CREATE POLICY "Authenticated users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow users to read organizations they're creating
-- (before their profile is created)
CREATE POLICY "Users can view all organizations during creation" ON organizations
  FOR SELECT USING (auth.uid() IS NOT NULL);

