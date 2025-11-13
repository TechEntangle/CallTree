/**
 * Dashboard Page (Protected)
 * Main app interface after sign-in
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getCurrentProfile } from '../lib/api/profiles'
import type { Database } from '../../../shared/types/database.types'
import './Dashboard.css'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkProfile() {
      try {
        const userProfile = await getCurrentProfile()
        
        if (!userProfile || !userProfile.organization_id) {
          // No profile or no organization - redirect to setup
          navigate('/setup', { replace: true })
          return
        }
        
        setProfile(userProfile)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    checkProfile()
  }, [navigate])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p>Loading your workspace...</p>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <svg
              width="32"
              height="32"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="20" fill="#10b981" />
              <path
                d="M24 8V24M24 24L16 32M24 24L32 32M24 24L16 16M24 24L32 16"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <h1>CallTree</h1>
          </div>
          <div className="user-section">
            <div className="user-info-header">
              <span className="user-name">{profile?.full_name || 'User'}</span>
              <span className="user-role">{profile?.role}</span>
            </div>
            <button onClick={handleSignOut} className="signout-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 🎉</h2>
          <p>
            Your emergency communication system is ready to go. Let's build
            something amazing together!
          </p>
          
          <div className="org-info">
            <span className="org-badge">🏢 Organization ID: {profile?.organization_id?.slice(0, 8)}...</span>
            <span className="role-badge">{profile?.role?.toUpperCase()}</span>
          </div>
          
          <div className="status-grid">
            <div className="status-item clickable" onClick={() => navigate('/trees')}>
              <div className="status-icon">🌳</div>
              <div>
                <h3>Calling Trees</h3>
                <p>Build emergency hierarchies →</p>
              </div>
            </div>
            <div className="status-item">
              <div className="status-icon">✅</div>
              <div>
                <h3>Database</h3>
                <p>8 tables with RLS</p>
              </div>
            </div>
            <div className="status-item">
              <div className="status-icon">✅</div>
              <div>
                <h3>Authentication</h3>
                <p>Google OAuth working</p>
              </div>
            </div>
            <div className="status-item">
              <div className="status-icon">⏳</div>
              <div>
                <h3>Notifications</h3>
                <p>Coming soon</p>
              </div>
            </div>
          </div>

          <div className="next-steps">
            <h3>Quick Actions:</h3>
            <div className="quick-actions">
              <button onClick={() => navigate('/trees')} className="action-btn">
                <span>🌳</span>
                <div>
                  <strong>Manage Trees</strong>
                  <p>View and create calling trees</p>
                </div>
              </button>
              <button onClick={() => navigate('/trees/new')} className="action-btn">
                <span>✨</span>
                <div>
                  <strong>Create New Tree</strong>
                  <p>Build an emergency hierarchy</p>
                </div>
              </button>
            </div>
          </div>

          <div className="user-info">
            <h3>Your Info:</h3>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      </main>
    </div>
  )
}

