/**
 * Notification History Page
 * Lists all past emergency notifications for the organization
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getCurrentProfile } from '../lib/api/profiles'
import type { Database } from '../../../shared/types/database.types'
import './NotificationHistory.css'

type Notification = Database['public']['Tables']['notifications']['Row']
type CallingTree = Database['public']['Tables']['calling_trees']['Row']

interface NotificationWithTree extends Notification {
  tree: CallingTree
}

export default function NotificationHistory() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<NotificationWithTree[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    try {
      const profile = await getCurrentProfile()
      if (!profile?.organization_id) {
        setError('No organization found')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('notifications')
        .select(
          `
          *,
          tree:calling_trees(*)
        `
        )
        .eq('organization_id', profile.organization_id)
        .order('initiated_at', { ascending: false })

      if (error) throw error

      setNotifications(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true
    return n.status === filter
  })

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

  if (loading) {
    return (
      <div className="notification-history-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="notification-history-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Notifications</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="notification-history-container">
      {/* Header */}
      <div className="history-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>Emergency Notification History</h1>
          <p className="header-subtitle">
            View and manage all past emergency notifications for your organization
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="history-stats">
        <div className="stat-card">
          <div className="stat-value">{notifications.length}</div>
          <div className="stat-label">Total Notifications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {notifications.filter((n) => n.status === 'in_progress').length}
          </div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {notifications.filter((n) => n.status === 'completed').length}
          </div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {notifications.filter((n) => n.priority === 'critical').length}
          </div>
          <div className="stat-label">Critical</div>
        </div>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-button ${filter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          Active
        </button>
        <button
          className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No Notifications Found</h2>
          <p>
            {filter === 'all'
              ? 'No emergency notifications have been sent yet.'
              : `No ${filter} notifications found.`}
          </p>
          <button onClick={() => navigate('/trees')} className="btn-primary">
            Go to Calling Trees
          </button>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="notification-card"
              onClick={() => navigate(`/notifications/${notification.id}`)}
            >
              <div className="notification-card-header">
                <div className="notification-card-title">
                  <h3>{notification.title}</h3>
                  <div className="notification-card-badges">
                    <span
                      className={`priority-badge priority-${notification.priority}`}
                    >
                      {priorityEmojis[notification.priority]}{' '}
                      {notification.priority.toUpperCase()}
                    </span>
                    <span className={`status-badge status-${notification.status}`}>
                      {statusEmojis[notification.status]}{' '}
                      {notification.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <button className="view-details-button">
                  View Details →
                </button>
              </div>

              <p className="notification-card-message">{notification.message}</p>

              <div className="notification-card-meta">
                <div className="meta-item">
                  <span className="meta-label">Tree:</span>
                  <span className="meta-value">{notification.tree?.name}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Initiated:</span>
                  <span className="meta-value">
                    {new Date(notification.initiated_at).toLocaleString()}
                  </span>
                </div>
                {notification.completed_at && (
                  <div className="meta-item">
                    <span className="meta-label">Completed:</span>
                    <span className="meta-value">
                      {new Date(notification.completed_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

