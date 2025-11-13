/**
 * Organization Setup Page
 * First-time user flow to create an organization
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import {
  createOrganization,
  generateSlug,
  checkSlugAvailable,
} from '../lib/api/organizations'
import { createProfile, getCurrentProfile, updateProfile } from '../lib/api/profiles'
import './OrganizationSetup.css'

export default function OrganizationSetup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [step, setStep] = useState<'choice' | 'welcome' | 'create'>('choice')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    fullName: user?.user_metadata?.full_name || '',
  })

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function handleSkipOrganization() {
    if (!user) return
    
    setLoading(true)
    setError(null)

    try {
      // Create or update profile without organization
      const existingProfile = await getCurrentProfile()
      
      if (existingProfile) {
        // Profile exists, just update full name if needed
        if (formData.fullName && formData.fullName !== existingProfile.full_name) {
          await updateProfile(user.id, { full_name: formData.fullName })
        }
      } else {
        // Create new profile without organization
        await createProfile({
          userId: user.id,
          email: user.email || '',
          fullName: formData.fullName || user.user_metadata?.name || 'Unknown',
          role: 'member',
        })
      }

      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }
  
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  // Auto-generate slug from organization name
  useEffect(() => {
    if (formData.name) {
      const generatedSlug = generateSlug(formData.name)
      setFormData(prev => ({ ...prev, slug: generatedSlug }))
    }
  }, [formData.name])

  // Check slug availability with debounce
  useEffect(() => {
    if (!formData.slug) {
      setSlugAvailable(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setSlugChecking(true)
      try {
        const available = await checkSlugAvailable(formData.slug)
        setSlugAvailable(available)
      } catch (err) {
        console.error('Error checking slug:', err)
      } finally {
        setSlugChecking(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.slug])

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to create an organization')
      return
    }

    if (!slugAvailable) {
      setError('Please choose an available organization slug')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create organization
      const organization = await createOrganization({
        name: formData.name,
        slug: formData.slug,
      })

      // Create profile linking user to organization as admin
      await createProfile({
        userId: user.id,
        email: user.email!,
        organizationId: organization.id,
        fullName: formData.fullName || undefined,
        role: 'admin',
      })

      // Success! Redirect to dashboard
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      console.error('Error creating organization:', err)
      setError(err.message || 'Failed to create organization')
      setLoading(false)
    }
  }

  // Show choice screen
  if (step === 'choice') {
    return (
      <div className="org-setup-container">
        <button onClick={handleSignOut} className="logout-btn-setup">
          Sign Out
        </button>
        
        <div className="org-setup-card">
          <div className="org-setup-header">
            <div className="logo">🌳</div>
            <h1>Welcome to CallTree!</h1>
            <p className="subtitle">
              How would you like to proceed?
            </p>
          </div>

          <div className="welcome-content">
            <div className="choice-container">
              <div className="choice-option">
                <div className="choice-icon-large">🏢</div>
                <h3>Create New Organization</h3>
                <p>Start a new organization and invite your team</p>
                <button
                  onClick={() => setStep('welcome')}
                  className="primary-button"
                >
                  Create Organization
                </button>
              </div>

              <div className="choice-divider">
                <span>OR</span>
              </div>

              <div className="choice-option">
                <div className="choice-icon-large">👤</div>
                <h3>Join Existing Organization</h3>
                <p>Skip and wait for an admin to add you</p>
                <button
                  onClick={handleSkipOrganization}
                  className="secondary-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Skip for Now'}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show welcome/intro screen
  if (step === 'welcome') {
    return (
      <div className="org-setup-container">
        <button onClick={handleSignOut} className="logout-btn-setup">
          Sign Out
        </button>
        
        <div className="org-setup-card">
          <button onClick={() => setStep('choice')} className="back-btn">
            ← Back
          </button>
          
          <div className="org-setup-header">
            <div className="logo">🌳</div>
            <h1>Welcome to CallTree!</h1>
            <p className="subtitle">
              Let's set up your emergency communication system
            </p>
          </div>

          <div className="welcome-content">
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">🏢</span>
                <div>
                  <h3>Create Your Organization</h3>
                  <p>Set up your workspace for your team</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <div>
                  <h3>Invite Team Members</h3>
                  <p>Add colleagues and assign roles</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌳</span>
                <div>
                  <h3>Build Calling Trees</h3>
                  <p>Design your emergency notification hierarchy</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚨</span>
                <div>
                  <h3>Send Notifications</h3>
                  <p>Rapidly communicate during emergencies</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('create')}
              className="primary-button"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="org-setup-container">
      <button onClick={handleSignOut} className="logout-btn-setup">
        Sign Out
      </button>
      
      <div className="org-setup-card">
        <button onClick={() => setStep('choice')} className="back-btn">
          ← Back
        </button>
        <div className="org-setup-header">
          <div className="logo">🏢</div>
          <h1>Create Your Organization</h1>
          <p className="subtitle">
            You'll be the administrator with full access
          </p>
        </div>

        {error && (
          <div className="error-banner">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleCreateOrganization} className="org-setup-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">Your Full Name</label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="John Doe"
              required
            />
          </div>

          {/* Organization Name */}
          <div className="form-group">
            <label htmlFor="name">Organization Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Acme Corporation"
              required
              disabled={loading}
            />
            <p className="field-hint">
              Your company or organization name
            </p>
          </div>

          {/* Organization Slug */}
          <div className="form-group">
            <label htmlFor="slug">Organization URL *</label>
            <div className="slug-input-wrapper">
              <span className="slug-prefix">calltree.app/</span>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="acme-corp"
                pattern="[a-z0-9\-]+"
                required
                disabled={loading}
              />
            </div>
            {slugChecking && (
              <p className="field-hint checking">Checking availability...</p>
            )}
            {!slugChecking && slugAvailable === true && (
              <p className="field-hint available">✓ Available</p>
            )}
            {!slugChecking && slugAvailable === false && (
              <p className="field-hint unavailable">✗ Already taken</p>
            )}
            <p className="field-hint">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="primary-button"
            disabled={loading || !slugAvailable || slugChecking}
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </button>

          <button
            type="button"
            onClick={() => setStep('welcome')}
            className="secondary-button"
            disabled={loading}
          >
            Back
          </button>
        </form>
      </div>
    </div>
  )
}

