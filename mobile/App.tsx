import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import * as Linking from 'expo-linking'
import { AuthProvider, useAuth } from './src/contexts/AuthContext'
import { supabase } from './src/lib/supabase'
import LoginScreen from './src/screens/LoginScreen'
import HomeScreen from './src/screens/HomeScreen'

function AppContent() {
  const { user, loading } = useAuth()

  // Handle OAuth deep link redirects
  useEffect(() => {
    // Listen for deep links from Expo auth proxy
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url
      console.log('Received deep link:', url)
      
      // Parse URL for auth tokens (comes from expo auth proxy)
      try {
        const urlObj = new URL(url)
        const accessToken = urlObj.searchParams.get('access_token')
        const refreshToken = urlObj.searchParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          console.log('Setting session with tokens from deep link')
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
        } else {
          // Try the hash fragment (some OAuth providers use this)
          const hash = urlObj.hash.substring(1) // Remove the #
          const params = new URLSearchParams(hash)
          const hashAccessToken = params.get('access_token')
          const hashRefreshToken = params.get('refresh_token')
          
          if (hashAccessToken && hashRefreshToken) {
            console.log('Setting session with tokens from hash')
            await supabase.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken,
            })
          }
        }
      } catch (error) {
        console.error('Error parsing deep link:', error)
      }
    }

    // Subscribe to deep link events
    const subscription = Linking.addEventListener('url', handleDeepLink)

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url })
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    )
  }

  return (
    <>
      {user ? <HomeScreen /> : <LoginScreen />}
      <StatusBar style="auto" />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
})
