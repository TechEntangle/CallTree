/**
 * Calling Trees List Page
 * Shows all calling trees and allows creating new ones
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentProfile } from '../lib/api/profiles'
import { getCallingTrees, deleteCallingTree } from '../lib/api/callingTrees'
import type { Database } from '../../../shared/types/database.types'
import './CallingTrees.css'

type CallingTree = Database['public']['Tables']['calling_trees']['Row']

export default function CallingTrees() {
  const navigate = useNavigate()
  const [trees, setTrees] = useState<CallingTree[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTrees()
  }, [])

  async function loadTrees() {
    try {
      const profile = await getCurrentProfile()
      if (!profile?.organization_id) {
        setError('No organization found')
        return
      }

      const data = await getCallingTrees(profile.organization_id)
      setTrees(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(treeId: string, treeName: string) {
    if (!confirm(`Are you sure you want to delete "${treeName}"?`)) return

    try {
      await deleteCallingTree(treeId)
      setTrees(trees.filter((t) => t.id !== treeId))
    } catch (err: any) {
      alert(`Error deleting tree: ${err.message}`)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'status-active'
      case 'draft':
        return 'status-draft'
      case 'archived':
        return 'status-archived'
      default:
        return ''
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'active':
        return '✅'
      case 'draft':
        return '📝'
      case 'archived':
        return '📦'
      default:
        return '❓'
    }
  }

  if (loading) {
    return (
      <div className="trees-container">
        <div className="trees-loading">
          <div className="spinner" />
          <p>Loading calling trees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="trees-container">
      {/* Header */}
      <div className="trees-header">
        <div>
          <h1>Calling Trees</h1>
          <p className="trees-subtitle">
            Manage your emergency notification hierarchies
          </p>
        </div>
        <button
          onClick={() => navigate('/trees/new')}
          className="btn-primary"
        >
          <span>+</span> Create New Tree
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Empty State */}
      {trees.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">🌳</div>
          <h2>No Calling Trees Yet</h2>
          <p>
            Create your first calling tree to set up emergency notification
            hierarchies
          </p>
          <button
            onClick={() => navigate('/trees/new')}
            className="btn-primary"
          >
            Create Your First Tree
          </button>
        </div>
      )}

      {/* Trees Grid */}
      {trees.length > 0 && (
        <div className="trees-grid">
          {trees.map((tree) => (
            <div key={tree.id} className="tree-card">
              {/* Card Header */}
              <div className="tree-card-header">
                <div className="tree-icon">🌳</div>
                <span className={`tree-status ${getStatusColor(tree.status)}`}>
                  {getStatusIcon(tree.status)} {tree.status}
                </span>
              </div>

              {/* Card Content */}
              <div className="tree-card-content">
                <h3>{tree.name}</h3>
                {tree.description && <p>{tree.description}</p>}

                <div className="tree-meta">
                  <div className="tree-meta-item">
                    <span className="meta-label">Timeout:</span>
                    <span className="meta-value">
                      {Math.floor(tree.timeout_seconds / 60)} min
                    </span>
                  </div>
                  <div className="tree-meta-item">
                    <span className="meta-label">Created:</span>
                    <span className="meta-value">
                      {new Date(tree.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="tree-card-actions">
                <button
                  onClick={() => navigate(`/trees/${tree.id}`)}
                  className="btn-secondary"
                >
                  View & Edit
                </button>
                <button
                  onClick={() => handleDelete(tree.id, tree.name)}
                  className="btn-danger-outline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

