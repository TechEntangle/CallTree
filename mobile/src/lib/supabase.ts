/**
 * Supabase Client Configuration for Mobile App
 * Provides typed Supabase client with authentication and secure storage
 */

import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../shared/types/database.types'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

/**
 * Supabase client instance with TypeScript types
 * - Uses AsyncStorage for secure token persistence
 * - Includes auth, database, and storage access
 * - Automatically handles JWT token refresh
 * - Row Level Security (RLS) enforced on all queries
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Mobile apps don't use URL-based auth
  },
})

/**
 * Helper function to get the current user session
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/**
 * Helper function to get the current user
 */
export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

/**
 * Helper function to sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Helper function to sign in with Google using OAuth
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'calltree://auth/callback', // Deep link for mobile
      skipBrowserRedirect: false,
    },
  })
  if (error) throw error
  return data
}

/**
 * Helper function to sign in with Apple (when available)
 */
export const signInWithApple = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: 'calltree://auth/callback', // Deep link for mobile
      skipBrowserRedirect: false,
    },
  })
  if (error) throw error
  return data
}

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (
  callback: (event: string, session: any) => void
) => {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Handle the OAuth callback URL
 * Call this when the app is opened via deep link after OAuth
 */
export const handleOAuthCallback = async (url: string) => {
  const { data, error } = await supabase.auth.getSessionFromUrl({ url })
  if (error) throw error
  return data.session
}

