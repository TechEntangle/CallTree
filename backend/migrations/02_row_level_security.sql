

-- Row Level Security (RLS) Policies
-- This ensures users can only access data from their organization

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE calling_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Organizations Policies
-- Users can read their own organization
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Admins can update their organization
CREATE POLICY "Admins can update their organization" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Profiles Policies
-- Users can view profiles in their organization
CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Calling Trees Policies
-- Users can view trees in their organization
CREATE POLICY "Users can view calling trees in their organization" ON calling_trees
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Admins and Managers can create trees
CREATE POLICY "Admins and Managers can create calling trees" ON calling_trees
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins and Managers can update trees
CREATE POLICY "Admins and Managers can update calling trees" ON calling_trees
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins can delete trees
CREATE POLICY "Admins can delete calling trees" ON calling_trees
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tree Nodes Policies
-- Users can view nodes in trees from their organization
CREATE POLICY "Users can view tree nodes in their organization" ON tree_nodes
  FOR SELECT USING (
    tree_id IN (
      SELECT id FROM calling_trees 
      WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Admins and Managers can manage tree nodes
CREATE POLICY "Admins and Managers can insert tree nodes" ON tree_nodes
  FOR INSERT WITH CHECK (
    tree_id IN (
      SELECT id FROM calling_trees 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Admins and Managers can update tree nodes" ON tree_nodes
  FOR UPDATE USING (
    tree_id IN (
      SELECT id FROM calling_trees 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Admins and Managers can delete tree nodes" ON tree_nodes
  FOR DELETE USING (
    tree_id IN (
      SELECT id FROM calling_trees 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

-- Notifications Policies
-- Users can view notifications in their organization
CREATE POLICY "Users can view notifications in their organization" ON notifications
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Admins and Managers can create notifications
CREATE POLICY "Admins and Managers can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admins and Managers can update notifications
CREATE POLICY "Admins and Managers can update notifications" ON notifications
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Notification Logs Policies
-- Users can view their own notification logs
CREATE POLICY "Users can view their own notification logs" ON notification_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    notification_id IN (
      SELECT id FROM notifications 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

-- System can insert notification logs (via edge functions)
CREATE POLICY "Authenticated users can insert notification logs" ON notification_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own logs (when acknowledging)
CREATE POLICY "Users can update their own notification logs" ON notification_logs
  FOR UPDATE USING (user_id = auth.uid());

-- Documents Policies
-- Users can view documents in their organization
CREATE POLICY "Users can view documents in their organization" ON documents
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Admins and Managers can manage documents
CREATE POLICY "Admins and Managers can insert documents" ON documents
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and Managers can update documents" ON documents
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and Managers can delete documents" ON documents
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Push Tokens Policies
-- Users can manage their own push tokens
CREATE POLICY "Users can view their own push tokens" ON push_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own push tokens" ON push_tokens
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own push tokens" ON push_tokens
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own push tokens" ON push_tokens
  FOR DELETE USING (user_id = auth.uid());

