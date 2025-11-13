-- Allow users to create calling trees
-- Migration 06: Allow Tree Creation

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert calling trees" ON calling_trees;
DROP POLICY IF EXISTS "Users can view org trees" ON calling_trees;
DROP POLICY IF EXISTS "Users can update org trees" ON calling_trees;
DROP POLICY IF EXISTS "Users can delete org trees" ON calling_trees;

-- Allow authenticated users to CREATE calling trees
CREATE POLICY "Users can insert calling trees"
  ON calling_trees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must belong to the organization
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Allow users to SELECT trees from their organization
CREATE POLICY "Users can view org trees"
  ON calling_trees
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Allow admins to UPDATE trees in their organization
CREATE POLICY "Users can update org trees"
  ON calling_trees
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Allow admins to DELETE trees in their organization
CREATE POLICY "Users can delete org trees"
  ON calling_trees
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

