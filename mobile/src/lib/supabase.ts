/**
 * Supabase Client Configuration for Mobile App
 * Provides typed Supabase client with authentication and secure storage
 */

import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import type { Database } from '../../../shared/types/database.types'

// Tell the browser to finish the auth session
WebBrowser.maybeCompleteAuthSession()

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
    // Use expo-web-browser for OAuth
    flowType: 'pkce',
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
  // Use Expo's auth proxy for production OAuth flow
  const redirectUrl = 'https://auth.expo.io/@tusharvartak/calltree'
  
  console.log('Using redirect URL:', redirectUrl)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  })
  
  if (error) throw error
  
  // Open the OAuth URL in the browser
  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl
    )
    
    console.log('Browser result:', result.type)
    
    if (result.type === 'success' && 'url' in result) {
      // Extract the URL from the result
      const { url } = result
      console.log('Redirect URL received:', url)
      
      // Parse the URL to get the auth code/tokens
      try {
        const urlObj = new URL(url)
        const accessToken = urlObj.searchParams.get('access_token') || 
                          new URLSearchParams(urlObj.hash.substring(1)).get('access_token')
        const refreshToken = urlObj.searchParams.get('refresh_token') ||
                           new URLSearchParams(urlObj.hash.substring(1)).get('refresh_token')
        
        if (accessToken && refreshToken) {
          console.log('Tokens found, setting session')
          // Set the session
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
        } else {
          console.log('No tokens found in URL')
        }
      } catch (err) {
        console.error('Error parsing tokens:', err)
      }
    }
  }
  
  return data
}

/**
 * Helper function to sign in with Apple (when available)
 */
export const signInWithApple = async () => {
  // Use Expo's auth proxy for production OAuth flow
  const redirectUrl = 'https://auth.expo.io/@tusharvartak/calltree'
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  })
  
  if (error) throw error
  
  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl
    )
    
    if (result.type === 'success' && 'url' in result) {
      const { url } = result
      const urlParams = new URL(url)
      const accessToken = urlParams.searchParams.get('access_token')
      const refreshToken = urlParams.searchParams.get('refresh_token')
      
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
      }
    }
  }
  
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

