import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getCurrentProfile, createProfile } from '../lib/api/profiles'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          navigate('/login', { replace: true })
          return
        }

        // Check if profile exists
        const profile = await getCurrentProfile()
        
        if (!profile) {
          // Create profile automatically
          console.log('Creating profile for new user:', session.user.email)
          try {
            await createProfile({
              userId: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
              role: 'member',
            })
          } catch (createErr: any) {
            // If duplicate key error, profile already exists - that's OK
            if (createErr.code !== '23505') {
              throw createErr
            }
            console.log('Profile already exists, continuing...')
          }
        }

        // Redirect to dashboard
        navigate('/dashboard', { replace: true })
      } catch (err: any) {
        console.error('Error in auth callback:', err)
        setError(err.message)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <p style={{ color: '#ef4444' }}>Error: {error}</p>
        <button onClick={() => navigate('/login')}>Back to Login</button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <p>Completing sign in...</p>
    </div>
  )
}
