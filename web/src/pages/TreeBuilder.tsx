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
} from '../lib/api/callingTrees'
import { getCurrentProfile } from '../lib/api/profiles'
import type { Database } from '../../../shared/types/database.types'
import './TreeBuilder.css'

type CallingTree = Database['public']['Tables']['calling_trees']['Row']
type TreeNode = Database['public']['Tables']['tree_nodes']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export default function TreeBuilder() {
  const { treeId } = useParams<{ treeId: string }>()
  const navigate = useNavigate()

  const [tree, setTree] = useState<CallingTree | null>(null)
  const [nodes, setNodes] = useState<TreeNode[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      const [treeData, nodesData, profileData] = await Promise.all([
        getCallingTree(treeId),
        getTreeNodes(treeId),
        getCurrentProfile(),
      ])

      if (!treeData) {
        setError('Tree not found')
        setLoading(false)
        return
      }

      setTree(treeData)
      setNodes(nodesData)
      setProfile(profileData)
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
            <button onClick={handleArchive} className="btn-warning">
              Archive Tree
            </button>
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
        {nodes.length === 0 ? (
          /* Empty State */
          <div className="empty-tree-state">
            <div className="empty-icon">🌱</div>
            <h2>No Team Members Added Yet</h2>
            <p>
              Start building your calling tree by adding team members and
              organizing them into notification levels
            </p>
            <button
              onClick={() => alert('Add member feature coming soon!')}
              className="btn-primary"
            >
              + Add First Member
            </button>
          </div>
        ) : (
          /* Tree Visualization */
          <div className="tree-visualization">
            <h3>Tree Structure (Coming Soon)</h3>
            <p>Visual tree builder will be displayed here</p>
            <div className="nodes-preview">
              {nodes.map((node) => (
                <div key={node.id} className="node-preview">
                  <span>Level {node.level}</span>
                  <span>Position {node.position}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

