import { supabase } from '../supabase';

export interface Notification {
  id: string;
  tree_id: string;
  organization_id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  initiated_by: string;
  initiated_at: string;
  completed_at?: string;
  metadata: Record<string, any>;
}

export interface NotificationLog {
  id: string;
  notification_id: string;
  node_id: string;
  user_id: string;
  level: number;
  status: 'pending' | 'sent' | 'delivered' | 'acknowledged' | 'failed' | 'timeout' | 'escalated';
  sent_at?: string;
  delivered_at?: string;
  acknowledged_at?: string;
  response?: string;
  escalated_to?: string;
  created_at: string;
}

export interface NotificationStatus {
  current_level: number | null;
  total_levels: number;
  total_sent: number;
  total_acknowledged: number;
  total_pending: number;
  progress_percentage: number;
}

export interface NotificationWithLogs extends Notification {
  logs: NotificationLog[];
}

/**
 * Trigger a new emergency notification
 */
export async function triggerNotification(
  treeId: string,
  title: string,
  message: string,
  priority: 'low' | 'medium' | 'high' | 'critical' = 'high'
): Promise<{ data: string | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('trigger_notification', {
      p_tree_id: treeId,
      p_title: title,
      p_message: message,
      p_priority: priority
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error triggering notification:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get all notifications for a tree
 */
export async function getNotificationsByTree(treeId: string): Promise<{
  data: Notification[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('tree_id', treeId)
      .order('initiated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get a single notification with its logs
 */
export async function getNotificationWithLogs(notificationId: string): Promise<{
  data: NotificationWithLogs | null;
  error: Error | null;
}> {
  try {
    // Get notification
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (notifError) throw notifError;

    // Get logs with user profiles
    const { data: logs, error: logsError } = await supabase
      .from('notification_logs')
      .select(`
        *,
        user:profiles!notification_logs_user_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('notification_id', notificationId)
      .order('level', { ascending: true });

    if (logsError) throw logsError;

    return {
      data: { ...notification, logs: logs || [] },
      error: null
    };
  } catch (error) {
    console.error('Error fetching notification with logs:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get real-time status of a notification
 */
export async function getNotificationStatus(notificationId: string): Promise<{
  data: NotificationStatus | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.rpc('get_notification_status', {
      p_notification_id: notificationId
    });

    if (error) throw error;
    return { data: data?.[0] || null, error: null };
  } catch (error) {
    console.error('Error fetching notification status:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Acknowledge a notification (user responds)
 */
export async function acknowledgeNotification(
  notificationId: string,
  response: string = 'Acknowledged'
): Promise<{ data: boolean | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('acknowledge_notification', {
      p_notification_id: notificationId,
      p_response: response
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error acknowledging notification:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Escalate notification to next level
 */
export async function escalateNotification(
  notificationId: string,
  fromLevel: number
): Promise<{ data: boolean | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('escalate_notification', {
      p_notification_id: notificationId,
      p_from_level: fromLevel
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error escalating notification:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Check if a level is complete (all users acknowledged)
 */
export async function checkLevelComplete(
  notificationId: string,
  level: number
): Promise<{ data: boolean | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('check_level_complete', {
      p_notification_id: notificationId,
      p_level: level
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error checking level complete:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Subscribe to notification updates
 */
export function subscribeToNotification(
  notificationId: string,
  onUpdate: (payload: any) => void
) {
  return supabase
    .channel(`notification:${notificationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notification_logs',
        filter: `notification_id=eq.${notificationId}`
      },
      onUpdate
    )
    .subscribe();
}

