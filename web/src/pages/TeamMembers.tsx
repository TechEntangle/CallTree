/**
 * Team Members Page
 * View and manage organization team members
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getCurrentProfile } from '../lib/api/profiles'
import {
  getTeamMembers,
  getTeamStats,
  updateMemberRole,
  removeMemberFromOrganization,
  getPendingUsers,
  addUserToOrganization,
} from '../lib/api/teamMembers'
import type { Database } from '../../../shared/types/database.types'
import './TeamMembers.css'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function TeamMembers() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [members, setMembers] = useState<Profile[]>([])
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([])
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({ total: 0, admins: 0, members: 0, viewers: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTeamData()
  }, [])

  async function loadTeamData() {
    try {
      const profile = await getCurrentProfile()
      if (!profile?.organization_id) {
        setError('No organization found')
        return
      }

      setCurrentProfile(profile)
      const [membersData, statsData, pendingData] = await Promise.all([
        getTeamMembers(profile.organization_id),
        getTeamStats(profile.organization_id),
        getPendingUsers(),
      ])

      setMembers(membersData)
      setStats(statsData)
      setPendingUsers(pendingData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: 'admin' | 'member' | 'viewer') {
    if (userId === user?.id) {
      alert('You cannot change your own role')
      return
    }

    try {
      await updateMemberRole(userId, newRole)
      await loadTeamData() // Reload to update stats
      alert(`✅ Role updated to ${newRole}`)
    } catch (err: any) {
      alert(`Error updating role: ${err.message}`)
    }
  }

  async function handleRemoveMember(userId: string, memberName: string) {
    if (userId === user?.id) {
      alert('You cannot remove yourself from the organization')
      return
    }

    if (!confirm(`Are you sure you want to remove "${memberName}" from the organization?`)) {
      return
    }

    try {
      await removeMemberFromOrganization(userId)
      await loadTeamData()
      alert('✅ Member removed successfully')
    } catch (err: any) {
      alert(`Error removing member: ${err.message}`)
    }
  }

  async function handleAddToOrganization(userId: string, userName: string, role: 'admin' | 'member' | 'viewer' = 'member') {
    if (!currentProfile?.organization_id) return

    if (!confirm(`Add "${userName}" to your organization as ${role}?`)) {
      return
    }

    try {
      await addUserToOrganization(userId, currentProfile.organization_id, role)
      await loadTeamData()
      alert(`✅ ${userName} added successfully as ${role}!`)
    } catch (err: any) {
      alert(`Error adding user: ${err.message}`)
    }
  }

  function getRoleBadgeClass(role: string) {
    switch (role) {
      case 'admin':
        return 'role-badge-admin'
      case 'member':
        return 'role-badge-member'
      case 'viewer':
        return 'role-badge-viewer'
      default:
        return ''
    }
  }

  function getRoleIcon(role: string) {
    switch (role) {
      case 'admin':
        return '👑'
      case 'member':
        return '👤'
      case 'viewer':
        return '👁️'
      default:
        return '❓'
    }
  }

  if (loading) {
    return (
      <div className="team-container">
        <div className="team-loading">
          <div className="spinner" />
          <p>Loading team members...</p>
        </div>
      </div>
    )
  }

  const isAdmin = currentProfile?.role === 'admin'

  return (
    <div className="team-container">
      {/* Header */}
      <div className="team-header">
        <div>
          <h1>Team Members</h1>
          <p className="team-subtitle">Manage your organization's team</p>
        </div>
      </div>

      {/* Stats */}
      <div className="team-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Members</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div>
            <div className="stat-value">{stats.admins}</div>
            <div className="stat-label">Admins</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div>
            <div className="stat-value">{stats.members}</div>
            <div className="stat-label">Members</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div>
            <div className="stat-value">{stats.viewers}</div>
            <div className="stat-label">Viewers</div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Info Box */}
      <div className="info-box">
        <div className="info-icon">💡</div>
        <div>
          <h3>How to add team members</h3>
          <p>
            Team members must first sign up at your login page using Google or Apple Sign-In.
            Once they've created an account, they'll automatically appear here and you can
            assign them roles.
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="members-table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="member-name">
                        {member.full_name || 'Unknown User'}
                        {member.id === user?.id && (
                          <span className="you-badge">You</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="member-email">{member.email}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(member.role)}`}>
                    {getRoleIcon(member.role)} {member.role}
                  </span>
                </td>
                <td className="member-date">
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
                {isAdmin && (
                  <td>
                    {member.id === user?.id ? (
                      <span className="no-action">—</span>
                    ) : (
                      <div className="member-actions">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(
                              member.id,
                              e.target.value as 'admin' | 'member' | 'viewer'
                            )
                          }
                          className="role-select"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          onClick={() =>
                            handleRemoveMember(member.id, member.full_name || 'this member')
                          }
                          className="btn-remove"
                          title="Remove member"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Users Section */}
      {isAdmin && pendingUsers.length > 0 && (
        <div className="pending-users-section">
          <h2>Pending Users ({pendingUsers.length})</h2>
          <p className="section-description">
            These users have signed up but haven't been added to any organization yet.
            You can add them to your organization.
          </p>

          <div className="pending-users-table-container">
            <table className="members-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((pendingUser) => (
                  <tr key={pendingUser.id}>
                    <td>
                      <div className="member-info">
                        <div className="member-avatar">
                          {pendingUser.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="member-name">
                            {pendingUser.full_name || 'Unknown User'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="member-email">{pendingUser.email}</td>
                    <td className="member-date">
                      {new Date(pendingUser.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="member-actions">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddToOrganization(
                                pendingUser.id,
                                pendingUser.full_name || 'this user',
                                e.target.value as 'admin' | 'member' | 'viewer'
                              )
                              e.target.value = '' // Reset
                            }
                          }}
                          className="role-select"
                          defaultValue=""
                        >
                          <option value="" disabled>Add as...</option>
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Descriptions */}
      <div className="role-descriptions">
        <h3>Role Permissions</h3>
        <div className="role-desc-grid">
          <div className="role-desc">
            <div className="role-desc-header">
              <span className="role-badge role-badge-admin">👑 Admin</span>
            </div>
            <ul>
              <li>Full access to all features</li>
              <li>Manage team members and roles</li>
              <li>Create and manage calling trees</li>
              <li>Send emergency notifications</li>
            </ul>
          </div>
          <div className="role-desc">
            <div className="role-desc-header">
              <span className="role-badge role-badge-member">👤 Member</span>
            </div>
            <ul>
              <li>View calling trees</li>
              <li>Participate in notification chains</li>
              <li>Respond to emergency notifications</li>
              <li>View notification history</li>
            </ul>
          </div>
          <div className="role-desc">
            <div className="role-desc-header">
              <span className="role-badge role-badge-viewer">👁️ Viewer</span>
            </div>
            <ul>
              <li>View calling trees (read-only)</li>
              <li>View notification history</li>
              <li>No participation in chains</li>
              <li>No sending notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

