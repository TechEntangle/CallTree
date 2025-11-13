/**
 * Dashboard Page (Protected)
 * Main app interface after sign-in
 */

import { useAuth } from '../lib/AuthContext'
import './Dashboard.css'

export default function Dashboard() {
  const { user, signOut } = useAuth()

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
            <span className="user-email">{user?.email}</span>
            <button onClick={handleSignOut} className="signout-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome to CallTree! 🎉</h2>
          <p>
            Your emergency communication system is ready to go. Let's build
            something amazing together!
          </p>
          
          <div className="status-grid">
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
                <h3>Calling Trees</h3>
                <p>Coming next</p>
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
            <h3>Next Steps:</h3>
            <ol>
              <li>Create your organization profile</li>
              <li>Invite team members</li>
              <li>Build your first calling tree</li>
              <li>Test emergency notifications</li>
            </ol>
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

