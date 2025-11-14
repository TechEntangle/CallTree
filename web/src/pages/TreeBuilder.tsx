/**
 * Tree Builder Page
 * Visual editor for managing calling tree nodes
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getCallingTree,
  getTreeNodes,
  updateCallingTree,
  activateCallingTree,
  archiveCallingTree,
  createTreeNode,
  deleteTreeNode,
} from '../lib/api/callingTrees'
import { getCurrentProfile } from '../lib/api/profiles'
import { getTeamMembers } from '../lib/api/teamMembers'
import { triggerNotification } from '../lib/api/notifications'
import type { Database } from '../../../shared/types/database.types'
import './TreeBuilder.css'

type CallingTree = Database['public']['Tables']['calling_trees']['Row']
type TreeNode = Database['public']['Tables']['tree_nodes']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export default function TreeBuilder() {
  const { treeId } = useParams<{ treeId: string }>()
  const navigate = useNavigate()

  const [tree, setTree] = useState<CallingTree | null>(null)
  const [nodes, setNodes] = useState<any[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<number>(1)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationPriority, setNotificationPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadTreeData()
  }, [treeId])

  async function loadTreeData() {
    if (!treeId) {
      setError('No tree ID provided')
      setLoading(false)
      return
    }

    try {
      const profileData = await getCurrentProfile()
      if (!profileData?.organization_id) {
        setError('No organization found')
        setLoading(false)
        return
      }

      const [treeData, nodesData, membersData] = await Promise.all([
        getCallingTree(treeId),
        getTreeNodes(treeId),
        getTeamMembers(profileData.organization_id),
      ])

      if (!treeData) {
        setError('Tree not found')
        setLoading(false)
        return
      }

      setTree(treeData)
      setNodes(nodesData)
      setProfile(profileData)
      setTeamMembers(membersData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleActivate() {
    if (!treeId) return

    if (
      !confirm(
        'Are you sure you want to activate this tree? It will be available for emergency notifications.'
      )
    )
      return

    try {
      const updated = await activateCallingTree(treeId)
      setTree(updated)
      alert('✅ Tree activated successfully!')
    } catch (err: any) {
      alert(`Error activating tree: ${err.message}`)
    }
  }

  async function handleArchive() {
    if (!treeId) return

    if (!confirm('Are you sure you want to archive this tree?')) return

    try {
      const updated = await archiveCallingTree(treeId)
      setTree(updated)
      alert('📦 Tree archived successfully!')
    } catch (err: any) {
      alert(`Error archiving tree: ${err.message}`)
    }
  }

  async function handleAddMember() {
    if (!treeId || !selectedMember) return

    try {
      // Get the next position for this level
      const nodesAtLevel = nodes.filter((n) => n.level === selectedLevel)
      const nextPosition = nodesAtLevel.length

      await createTreeNode({
        treeId,
        userId: selectedMember,
        level: selectedLevel,
        position: nextPosition,
      })

      // Reload tree data
      await loadTreeData()
      
      // Reset form
      setShowAddMember(false)
      setSelectedMember('')
      setSelectedLevel(1)
      
      alert('✅ Member added to tree!')
    } catch (err: any) {
      alert(`Error adding member: ${err.message}`)
    }
  }

  async function handleRemoveNode(nodeId: string) {
    if (!confirm('Remove this member from the tree?')) return

    try {
      await deleteTreeNode(nodeId)
      await loadTreeData()
      alert('✅ Member removed from tree!')
    } catch (err: any) {
      alert(`Error removing member: ${err.message}`)
    }
  }

  async function handleSendNotification() {
    if (!treeId || !notificationTitle || !notificationMessage) {
      alert('Please fill in all fields')
      return
    }

    if (nodes.length === 0) {
      alert('Cannot send notification: Tree has no members')
      return
    }

    setSending(true)
    try {
      const { data, error } = await triggerNotification(
        treeId,
        notificationTitle,
        notificationMessage,
        notificationPriority
      )

      if (error) throw error

      // Reset form
      setShowNotificationModal(false)
      setNotificationTitle('')
      setNotificationMessage('')
      setNotificationPriority('high')

      alert('🚨 Emergency notification sent successfully!')
      
      // Navigate to notification status page
      if (data) {
        navigate(`/notifications/${data}`)
      }
    } catch (err: any) {
      alert(`Error sending notification: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  // Get members not yet in the tree
  const availableMembers = teamMembers.filter(
    (member) => !nodes.some((node) => node.user_id === member.id)
  )

  // Group nodes by level
  const nodesByLevel = nodes.reduce((acc: any, node: any) => {
    if (!acc[node.level]) acc[node.level] = []
    acc[node.level].push(node)
    return acc
  }, {})

  const maxLevel = Math.max(0, ...nodes.map((n) => n.level))

  if (loading) {
    return (
      <div className="tree-builder-container">
        <div className="tree-loading">
          <div className="spinner" />
          <p>Loading tree...</p>
        </div>
      </div>
    )
  }

  if (error || !tree) {
    return (
      <div className="tree-builder-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Tree</h2>
          <p>{error || 'Tree not found'}</p>
          <button onClick={() => navigate('/trees')} className="btn-primary">
            Back to Trees
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="tree-builder-container">
      {/* Header */}
      <div className="tree-builder-header">
        <div className="header-left">
          <button onClick={() => navigate('/trees')} className="back-button">
            ← Back to Trees
          </button>
          <div className="tree-title">
            <h1>{tree.name}</h1>
            <span className={`tree-status status-${tree.status}`}>
              {tree.status === 'active' && '✅'}
              {tree.status === 'draft' && '📝'}
              {tree.status === 'archived' && '📦'}
              {tree.status}
            </span>
          </div>
          {tree.description && (
            <p className="tree-description">{tree.description}</p>
          )}
        </div>
        <div className="header-actions">
          {tree.status === 'draft' && (
            <button onClick={handleActivate} className="btn-success">
              Activate Tree
            </button>
          )}
          {tree.status === 'active' && (
            <>
              <button 
                onClick={() => setShowNotificationModal(true)} 
                className="btn-emergency"
                disabled={nodes.length === 0}
              >
                🚨 Send Emergency Notification
              </button>
              <button onClick={handleArchive} className="btn-warning">
                Archive Tree
              </button>
            </>
          )}
          <button
            onClick={() => navigate(`/trees/${treeId}/edit`)}
            className="btn-secondary"
          >
            Edit Settings
          </button>
        </div>
      </div>

      {/* Tree Info */}
      <div className="tree-info-bar">
        <div className="info-item">
          <span className="info-label">Timeout:</span>
          <span className="info-value">
            {Math.floor(tree.timeout_seconds / 60)} minutes
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Nodes:</span>
          <span className="info-value">{nodes.length}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Created:</span>
          <span className="info-value">
            {new Date(tree.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="tree-builder-content">
        <div className="tree-builder-grid">
          {/* Left Side - Tree Structure */}
          <div className="tree-structure-panel">
            <div className="panel-header">
              <h3>Tree Structure</h3>
              <button
                onClick={() => setShowAddMember(true)}
                className="btn-primary-small"
                disabled={availableMembers.length === 0}
              >
                + Add Member
              </button>
            </div>

            {nodes.length === 0 ? (
              <div className="empty-tree-state">
                <div className="empty-icon">🌱</div>
                <h4>No Members Yet</h4>
                <p>Add team members to start building your calling tree</p>
              </div>
            ) : (
              <div className="tree-levels">
                {Array.from({ length: maxLevel }).map((_, index) => {
                  const level = index + 1
                  const levelNodes = nodesByLevel[level] || []
                  
                  return (
                    <div key={level} className="tree-level">
                      <div className="level-header">
                        <span className="level-badge">Level {level}</span>
                        <span className="level-count">{levelNodes.length} {levelNodes.length === 1 ? 'member' : 'members'}</span>
                      </div>
                      <div className="level-nodes">
                        {levelNodes.map((node: any) => (
                          <div key={node.id} className="tree-node-card">
                            <div className="node-avatar">
                              {node.user?.full_name?.charAt(0) || '?'}
                            </div>
                            <div className="node-info">
                              <div className="node-name">{node.user?.full_name || 'Unknown'}</div>
                              <div className="node-email">{node.user?.email}</div>
                            </div>
                            <button
                              onClick={() => handleRemoveNode(node.id)}
                              className="btn-remove-node"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Side - Available Members */}
          <div className="available-members-panel">
            <div className="panel-header">
              <h3>Available Members</h3>
              <span className="member-count">{availableMembers.length}</span>
            </div>

            {availableMembers.length === 0 ? (
              <div className="no-members-state">
                <p>✅ All team members are in the tree!</p>
              </div>
            ) : (
              <div className="members-list">
                {availableMembers.map((member) => (
                  <div key={member.id} className="member-card">
                    <div className="member-avatar">
                      {member.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{member.full_name || 'Unknown'}</div>
                      <div className="member-role">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Member to Tree</h3>
              <button onClick={() => setShowAddMember(false)} className="modal-close">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Select Member</label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a member...</option>
                  {availableMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Notification Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                  className="form-select"
                >
                  {Array.from({ length: Math.max(5, maxLevel + 1) }).map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      Level {index + 1} {index === 0 && '(First to be notified)'}
                    </option>
                  ))}
                </select>
                <p className="field-hint">
                  Level 1 members are notified first. If they don't respond, Level 2 is notified, and so on.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowAddMember(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="btn-primary"
                disabled={!selectedMember}
              >
                Add to Tree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotificationModal && (
        <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
          <div className="modal-content notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>🚨 Send Emergency Notification</h3>
                <p className="modal-subtitle">
                  This will notify all {nodes.length} members in the calling tree
                </p>
              </div>
              <button onClick={() => setShowNotificationModal(false)} className="modal-close">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="e.g., Building Evacuation Required"
                  className="form-input"
                  maxLength={255}
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Provide clear instructions for the emergency situation..."
                  className="form-textarea"
                  rows={6}
                />
                <p className="field-hint">
                  Be clear and concise. Include what happened, what actions to take, and any relevant details.
                </p>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={notificationPriority}
                  onChange={(e) => setNotificationPriority(e.target.value as any)}
                  className="form-select"
                >
                  <option value="low">🟢 Low - Informational</option>
                  <option value="medium">🟡 Medium - Important</option>
                  <option value="high">🟠 High - Urgent</option>
                  <option value="critical">🔴 Critical - Life-threatening</option>
                </select>
              </div>

              <div className="notification-preview">
                <div className="preview-label">How it will be sent:</div>
                <ol className="notification-flow">
                  <li>
                    <strong>Level 0</strong> members will be notified immediately
                  </li>
                  <li>
                    If they don't respond within <strong>{Math.floor(tree.timeout_seconds / 60)} minutes</strong>, 
                    notification escalates to Level 1
                  </li>
                  <li>
                    Process continues through all {maxLevel + 1} levels until someone responds
                  </li>
                </ol>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setShowNotificationModal(false)} 
                className="btn-secondary"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                className="btn-emergency"
                disabled={!notificationTitle || !notificationMessage || sending}
              >
                {sending ? 'Sending...' : '🚨 Send Emergency Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

