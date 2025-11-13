-- RLS policies for tree_nodes table
-- Migration 12: Tree Nodes RLS

-- Enable RLS on tree_nodes
ALTER TABLE tree_nodes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view tree nodes" ON tree_nodes;
DROP POLICY IF EXISTS "Admins can insert tree nodes" ON tree_nodes;
DROP POLICY IF EXISTS "Admins can update tree nodes" ON tree_nodes;
DROP POLICY IF EXISTS "Admins can delete tree nodes" ON tree_nodes;

-- Policy: View tree nodes for trees in user's organization
CREATE POLICY "Users can view tree nodes"
  ON tree_nodes
  FOR SELECT
  TO authenticated
  USING (
    tree_id IN (
      SELECT id FROM calling_trees
      WHERE organization_id IN (
        SELECT org_id FROM public.get_current_user_profile()
      )
    )
  );

-- Policy: Admins can insert tree nodes
CREATE POLICY "Admins can insert tree nodes"
  ON tree_nodes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    'admin' IN (
      SELECT user_role FROM public.get_current_user_profile()
    )
    AND tree_id IN (
      SELECT id FROM calling_trees
      WHERE organization_id IN (
        SELECT org_id FROM public.get_current_user_profile()
      )
    )
  );

-- Policy: Admins can update tree nodes
CREATE POLICY "Admins can update tree nodes"
  ON tree_nodes
  FOR UPDATE
  TO authenticated
  USING (
    'admin' IN (
      SELECT user_role FROM public.get_current_user_profile()
    )
    AND tree_id IN (
      SELECT id FROM calling_trees
      WHERE organization_id IN (
        SELECT org_id FROM public.get_current_user_profile()
      )
    )
  )
  WITH CHECK (
    'admin' IN (
      SELECT user_role FROM public.get_current_user_profile()
    )
    AND tree_id IN (
      SELECT id FROM calling_trees
      WHERE organization_id IN (
        SELECT org_id FROM public.get_current_user_profile()
      )
    )
  );

-- Policy: Admins can delete tree nodes
CREATE POLICY "Admins can delete tree nodes"
  ON tree_nodes
  FOR DELETE
  TO authenticated
  USING (
    'admin' IN (
      SELECT user_role FROM public.get_current_user_profile()
    )
    AND tree_id IN (
      SELECT id FROM calling_trees
      WHERE organization_id IN (
        SELECT org_id FROM public.get_current_user_profile()
      )
    )
  );

