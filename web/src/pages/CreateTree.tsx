/**
 * Create Calling Tree Page
 * Form to create a new calling tree
 */

import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getCurrentProfile } from '../lib/api/profiles'
import { createCallingTree } from '../lib/api/callingTrees'
import './CreateTree.css'

export default function CreateTree() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    timeoutMinutes: 5,
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!user) {
      setError('You must be logged in')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const profile = await getCurrentProfile()
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const tree = await createCallingTree({
        organizationId: profile.organization_id,
        name: formData.name,
        description: formData.description || undefined,
        timeoutSeconds: formData.timeoutMinutes * 60,
        createdBy: user.id,
      })

      // Success! Navigate to the tree builder
      navigate(`/trees/${tree.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create tree')
      setLoading(false)
    }
  }

  return (
    <div className="create-tree-container">
      <div className="create-tree-card">
        {/* Header */}
        <div className="create-tree-header">
          <button onClick={() => navigate('/trees')} className="back-button">
            ← Back to Trees
          </button>
          <div>
            <h1>Create Calling Tree</h1>
            <p className="subtitle">
              Set up a new emergency notification hierarchy
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="create-tree-form">
          {/* Tree Name */}
          <div className="form-group">
            <label htmlFor="name">
              Tree Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Office Emergency, Weekend On-Call"
              required
              disabled={loading}
              maxLength={100}
            />
            <p className="field-hint">
              A descriptive name for this calling tree
            </p>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe when this tree should be used..."
              disabled={loading}
              rows={4}
              maxLength={500}
            />
            <p className="field-hint">
              Optional: Explain when to use this tree (max 500 characters)
            </p>
          </div>

          {/* Timeout */}
          <div className="form-group">
            <label htmlFor="timeout">
              Response Timeout <span className="required">*</span>
            </label>
            <div className="timeout-input-wrapper">
              <input
                type="number"
                id="timeout"
                value={formData.timeoutMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeoutMinutes: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                max="60"
                required
                disabled={loading}
              />
              <span className="timeout-unit">minutes</span>
            </div>
            <p className="field-hint">
              How long to wait for a response before escalating (1-60 minutes)
            </p>
          </div>

          {/* Info Box */}
          <div className="info-box">
            <div className="info-icon">💡</div>
            <div>
              <h3>What happens next?</h3>
              <p>
                After creating your tree, you'll be able to add team members and
                organize them into notification levels. When an emergency
                occurs, the system will notify each level in sequence.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/trees')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Tree'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

