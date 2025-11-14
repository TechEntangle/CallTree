/**
 * Notification Status Page
 * Shows real-time status of an active emergency notification
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getNotificationWithLogs,
  getNotificationStatus,
  acknowledgeNotification,
  escalateNotification,
  subscribeToNotification,
} from '../lib/api/notifications'
import { getCurrentProfile } from '../lib/api/profiles'
import type { NotificationWithLogs, NotificationStatus as StatusData } from '../lib/api/notifications'
import type { Database } from '../../../shared/types/database.types'
import './NotificationStatus.css'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function NotificationStatus() {
  const { notificationId } = useParams<{ notificationId: string }>()
  const navigate = useNavigate()

  const [notification, setNotification] = useState<NotificationWithLogs | null>(null)
  const [status, setStatus] = useState<StatusData | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acknowledging, setAcknowledging] = useState(false)

  useEffect(() => {
    loadData()
  }, [notificationId])

  useEffect(() => {
    if (!notificationId) return

    // Subscribe to real-time updates
    const channel = subscribeToNotification(notificationId, (payload) => {
      console.log('Notification update:', payload)
      loadData()
    })

    return () => {
      channel.unsubscribe()
    }
  }, [notificationId])

  async function loadData() {
    if (!notificationId) {
      setError('No notification ID provided')
      setLoading(false)
      return
    }

    try {
      const [notifData, statusData, profileData] = await Promise.all([
        getNotificationWithLogs(notificationId),
        getNotificationStatus(notificationId),
        getCurrentProfile(),
      ])

      if (notifData.error) throw notifData.error
      if (statusData.error) throw statusData.error

      setNotification(notifData.data)
      setStatus(statusData.data)
      setProfile(profileData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAcknowledge() {
    if (!notificationId) return

    if (!confirm('Acknowledge this emergency notification?')) return

    setAcknowledging(true)
    try {
      const { error } = await acknowledgeNotification(notificationId, 'Acknowledged')
      if (error) throw error

      await loadData()
      alert('✅ Notification acknowledged!')
    } catch (err: any) {
      alert(`Error acknowledging: ${err.message}`)
    } finally {
      setAcknowledging(false)
    }
  }

  async function handleEscalate() {
    if (!notificationId || status?.current_level === null) return

    if (!confirm(`Escalate to next level (Level ${(status.current_level || 0) + 1})?`)) return

    try {
      const { error } = await escalateNotification(notificationId, status.current_level || 0)
      if (error) throw error

      await loadData()
      alert('🔼 Notification escalated to next level!')
    } catch (err: any) {
      alert(`Error escalating: ${err.message}`)
    }
  }

  // Group logs by level
  const logsByLevel = notification?.logs.reduce((acc: any, log: any) => {
    if (!acc[log.level]) acc[log.level] = []
    acc[log.level].push(log)
    return acc
  }, {}) || {}

  const levels = Object.keys(logsByLevel)
    .map(Number)
    .sort((a, b) => a - b)

  // Check if current user needs to acknowledge
  const userLog = notification?.logs.find(
    (log: any) => log.user_id === profile?.id && log.status === 'sent'
  )

  const canAcknowledge = !!userLog && notification?.status === 'in_progress'
  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager'

  if (loading) {
    return (
      <div className="notification-status-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading notification...</p>
        </div>
      </div>
    )
  }

  if (error || !notification) {
    return (
      <div className="notification-status-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Notification</h2>
          <p>{error || 'Notification not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const priorityEmojis = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  }

  const statusEmojis = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
    failed: '❌',
  }

  return (
    <div className="notification-status-container">
      {/* Header */}
      <div className="status-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
          <div className="notification-title-section">
            <h1>{notification.title}</h1>
            <div className="notification-badges">
              <span className={`priority-badge priority-${notification.priority}`}>
                {priorityEmojis[notification.priority]} {notification.priority.toUpperCase()}
              </span>
              <span className={`status-badge status-${notification.status}`}>
                {statusEmojis[notification.status]} {notification.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        {canAcknowledge && (
          <button
            onClick={handleAcknowledge}
            className="btn-emergency"
            disabled={acknowledging}
          >
            {acknowledging ? 'Acknowledging...' : '✅ Acknowledge Notification'}
          </button>
        )}
        {isAdmin && notification.status === 'in_progress' && status?.current_level !== null && (
          <button onClick={handleEscalate} className="btn-warning">
            🔼 Escalate to Level {(status.current_level || 0) + 1}
          </button>
        )}
      </div>

      {/* Message Box */}
      <div className="notification-message-box">
        <div className="message-label">Emergency Message:</div>
        <div className="message-content">{notification.message}</div>
        <div className="message-meta">
          Initiated {new Date(notification.initiated_at).toLocaleString()}
          {notification.completed_at && (
            <> · Completed {new Date(notification.completed_at).toLocaleString()}</>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      {status && (
        <div className="progress-summary">
          <div className="progress-stats">
            <div className="stat-item">
              <div className="stat-value">{status.total_acknowledged}</div>
              <div className="stat-label">Acknowledged</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{status.total_pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{status.total_sent}</div>
              <div className="stat-label">Total Notified</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {status.current_level !== null ? `Level ${status.current_level}` : 'Complete'}
              </div>
              <div className="stat-label">Current Level</div>
            </div>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${status.progress_percentage}%` }}
            />
            <div className="progress-bar-label">{status.progress_percentage}% Complete</div>
          </div>
        </div>
      )}

      {/* Notification Logs by Level */}
      <div className="notification-logs">
        <h2>Notification Timeline</h2>
        {levels.map((level) => (
          <div
            key={level}
            className={`level-section ${
              status?.current_level === level ? 'level-active' : ''
            }`}
          >
            <div className="level-header">
              <h3>Level {level}</h3>
              <span className="level-badge">
                {logsByLevel[level].filter((l: any) => l.status === 'acknowledged').length} /{' '}
                {logsByLevel[level].length} responded
              </span>
              {status?.current_level === level && (
                <span className="active-indicator">🔴 Active</span>
              )}
            </div>
            <div className="level-logs">
              {logsByLevel[level].map((log: any) => (
                <div
                  key={log.id}
                  className={`log-item log-status-${log.status}`}
                >
                  <div className="log-user">
                    {log.user?.avatar_url && (
                      <img src={log.user.avatar_url} alt="" className="log-avatar" />
                    )}
                    {!log.user?.avatar_url && (
                      <div className="log-avatar-placeholder">
                        {log.user?.full_name?.[0] || log.user?.email?.[0] || '?'}
                      </div>
                    )}
                    <div className="log-user-info">
                      <div className="log-user-name">
                        {log.user?.full_name || log.user?.email}
                      </div>
                      <div className="log-user-email">{log.user?.email}</div>
                    </div>
                  </div>
                  <div className="log-status-info">
                    <span className={`log-status-badge status-${log.status}`}>
                      {log.status === 'sent' && '📤 Sent'}
                      {log.status === 'delivered' && '📬 Delivered'}
                      {log.status === 'acknowledged' && '✅ Acknowledged'}
                      {log.status === 'pending' && '⏳ Pending'}
                      {log.status === 'failed' && '❌ Failed'}
                      {log.status === 'timeout' && '⏱️ Timeout'}
                      {log.status === 'escalated' && '🔼 Escalated'}
                    </span>
                    {log.acknowledged_at && (
                      <div className="log-timestamp">
                        {new Date(log.acknowledged_at).toLocaleString()}
                      </div>
                    )}
                    {log.response && (
                      <div className="log-response">{log.response}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

