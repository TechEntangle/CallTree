/**
 * Login Page for Web App
 * Provides Google and Apple Sign-In options
 */

import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import './Login.css'

export default function Login() {
  const { signInWithGoogle, signInWithApple } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      await signInWithApple()
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Apple')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo/Header */}
        <div className="login-header">
          <div className="logo">
            <svg
              width="48"
              height="48"
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
          </div>
          <h1>CallTree</h1>
          <p className="subtitle">Emergency Communication System</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <svg
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Sign In Options */}
        <div className="signin-options">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="signin-button google"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path
                fill="#4285F4"
                d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
              />
              <path
                fill="#34A853"
                d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
              />
              <path
                fill="#FBBC05"
                d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
              />
              <path
                fill="#EA4335"
                d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleAppleSignIn}
            disabled={loading}
            className="signin-button apple"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15.769 8.643a4.57 4.57 0 00-2.703 3.982 4.542 4.542 0 002.924 4.248c-.123.37-.268.729-.435 1.075-.382.803-.783 1.584-1.406 1.595-.598.011-789.053-.877-1.725-.877-.686 0-1.382.855-2.246.876-.892.022-1.172-.867-1.609-1.765-1.085-2.228-1.909-6.297-.8-9.042a4.399 4.399 0 013.764-2.232c.729-.022 1.417.491 1.86.491.443 0 1.271-.607 2.145-.517.365.015 1.39.148 2.048.111.073-.005.001-.002-.017-.002zM12.995 5.3a4.411 4.411 0 01-1.045-3.146 4.508 4.508 0 012.923 1.511 4.295 4.295 0 011.01 2.966 3.812 3.812 0 01-2.888-1.331z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Secure sign-in powered by <strong>Supabase Auth</strong>
          </p>
          <p className="terms">
            By signing in, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

