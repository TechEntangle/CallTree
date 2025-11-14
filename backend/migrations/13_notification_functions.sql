-- Notification System Functions
-- These functions handle triggering and managing emergency notifications

-- Function to trigger a notification
-- This creates the notification and sends it to level 0 of the tree
CREATE OR REPLACE FUNCTION trigger_notification(
  p_tree_id UUID,
  p_title VARCHAR(255),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'high',
  p_initiated_by UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
  v_organization_id UUID;
  v_node RECORD;
BEGIN
  -- Get the organization_id from the tree
  SELECT organization_id INTO v_organization_id
  FROM calling_trees
  WHERE id = p_tree_id;

  IF v_organization_id IS NULL THEN
    RAISE EXCEPTION 'Tree not found';
  END IF;

  -- Create the notification
  INSERT INTO notifications (
    tree_id,
    organization_id,
    title,
    message,
    priority,
    status,
    initiated_by,
    initiated_at
  ) VALUES (
    p_tree_id,
    v_organization_id,
    p_title,
    p_message,
    p_priority,
    'in_progress',
    p_initiated_by,
    NOW()
  ) RETURNING id INTO v_notification_id;

  -- Create notification logs for all level 0 nodes
  FOR v_node IN 
    SELECT id, user_id, level
    FROM tree_nodes
    WHERE tree_id = p_tree_id AND level = 0
  LOOP
    INSERT INTO notification_logs (
      notification_id,
      node_id,
      user_id,
      level,
      status,
      sent_at
    ) VALUES (
      v_notification_id,
      v_node.id,
      v_node.user_id,
      v_node.level,
      'sent',
      NOW()
    );
  END LOOP;

  RETURN v_notification_id;
END;
$$;

-- Function to escalate to the next level
-- Called when level times out or when a level is complete
CREATE OR REPLACE FUNCTION escalate_notification(
  p_notification_id UUID,
  p_from_level INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tree_id UUID;
  v_next_level INTEGER;
  v_node RECORD;
  v_has_next_level BOOLEAN;
BEGIN
  -- Get the tree_id
  SELECT tree_id INTO v_tree_id
  FROM notifications
  WHERE id = p_notification_id;

  IF v_tree_id IS NULL THEN
    RAISE EXCEPTION 'Notification not found';
  END IF;

  -- Mark previous level as escalated
  UPDATE notification_logs
  SET status = 'escalated'
  WHERE notification_id = p_notification_id
    AND level = p_from_level
    AND status IN ('pending', 'sent', 'delivered');

  -- Get the next level
  v_next_level := p_from_level + 1;

  -- Check if next level exists
  SELECT EXISTS(
    SELECT 1 FROM tree_nodes
    WHERE tree_id = v_tree_id AND level = v_next_level
  ) INTO v_has_next_level;

  IF NOT v_has_next_level THEN
    -- No more levels, mark notification as completed
    UPDATE notifications
    SET status = 'completed',
        completed_at = NOW()
    WHERE id = p_notification_id;
    
    RETURN FALSE;
  END IF;

  -- Create notification logs for next level
  FOR v_node IN 
    SELECT id, user_id, level
    FROM tree_nodes
    WHERE tree_id = v_tree_id AND level = v_next_level
  LOOP
    INSERT INTO notification_logs (
      notification_id,
      node_id,
      user_id,
      level,
      status,
      sent_at
    ) VALUES (
      p_notification_id,
      v_node.id,
      v_node.user_id,
      v_node.level,
      'sent',
      NOW()
    );
  END LOOP;

  RETURN TRUE;
END;
$$;

-- Function to acknowledge a notification
-- Called when a user responds to a notification
CREATE OR REPLACE FUNCTION acknowledge_notification(
  p_notification_id UUID,
  p_user_id UUID DEFAULT auth.uid(),
  p_response TEXT DEFAULT 'Acknowledged'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  -- Update the notification log
  UPDATE notification_logs
  SET status = 'acknowledged',
      acknowledged_at = NOW(),
      response = p_response
  WHERE notification_id = p_notification_id
    AND user_id = p_user_id
    AND status IN ('pending', 'sent', 'delivered')
  RETURNING true INTO v_updated;

  RETURN COALESCE(v_updated, false);
END;
$$;

-- Function to check if all users in a level have acknowledged
CREATE OR REPLACE FUNCTION check_level_complete(
  p_notification_id UUID,
  p_level INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_all_acknowledged BOOLEAN;
BEGIN
  SELECT NOT EXISTS(
    SELECT 1 FROM notification_logs
    WHERE notification_id = p_notification_id
      AND level = p_level
      AND status IN ('pending', 'sent', 'delivered')
  ) INTO v_all_acknowledged;

  IF v_all_acknowledged THEN
    -- Mark notification as completed if this is the last level
    UPDATE notifications
    SET status = 'completed',
        completed_at = NOW()
    WHERE id = p_notification_id
      AND NOT EXISTS(
        SELECT 1 FROM notification_logs
        WHERE notification_id = p_notification_id
          AND level > p_level
      );
  END IF;

  RETURN v_all_acknowledged;
END;
$$;

-- Function to get notification status summary
CREATE OR REPLACE FUNCTION get_notification_status(
  p_notification_id UUID
)
RETURNS TABLE(
  current_level INTEGER,
  total_levels INTEGER,
  total_sent INTEGER,
  total_acknowledged INTEGER,
  total_pending INTEGER,
  progress_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH level_stats AS (
    SELECT 
      nl.level,
      COUNT(*) as total,
      SUM(CASE WHEN nl.status = 'acknowledged' THEN 1 ELSE 0 END) as acknowledged,
      SUM(CASE WHEN nl.status IN ('pending', 'sent', 'delivered') THEN 1 ELSE 0 END) as pending
    FROM notification_logs nl
    WHERE nl.notification_id = p_notification_id
    GROUP BY nl.level
  ),
  current_active_level AS (
    SELECT MIN(level) as level
    FROM level_stats
    WHERE pending > 0
  )
  SELECT 
    cal.level as current_level,
    (SELECT MAX(level) FROM level_stats) + 1 as total_levels,
    (SELECT SUM(total) FROM level_stats)::INTEGER as total_sent,
    (SELECT SUM(acknowledged) FROM level_stats)::INTEGER as total_acknowledged,
    (SELECT SUM(pending) FROM level_stats)::INTEGER as total_pending,
    ROUND(
      (SELECT SUM(acknowledged)::NUMERIC FROM level_stats) / 
      NULLIF((SELECT SUM(total)::NUMERIC FROM level_stats), 0) * 100, 
      2
    ) as progress_percentage
  FROM current_active_level cal;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION trigger_notification TO authenticated;
GRANT EXECUTE ON FUNCTION escalate_notification TO authenticated;
GRANT EXECUTE ON FUNCTION acknowledge_notification TO authenticated;
GRANT EXECUTE ON FUNCTION check_level_complete TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_status TO authenticated;

-- Add comment
COMMENT ON FUNCTION trigger_notification IS 'Triggers a new emergency notification and sends it to level 0 of the calling tree';
COMMENT ON FUNCTION escalate_notification IS 'Escalates a notification to the next level when timeout occurs';
COMMENT ON FUNCTION acknowledge_notification IS 'Records a user acknowledgment of a notification';
COMMENT ON FUNCTION check_level_complete IS 'Checks if all users in a level have acknowledged';
COMMENT ON FUNCTION get_notification_status IS 'Returns real-time status summary of a notification';

