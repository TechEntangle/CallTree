/**
 * Profile API Functions
 * Handles user profile creation and management
 */

import { supabase } from '../supabase'
import type { Database } from '../../../../shared/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

/**
 * Get current user's profile
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle() // Use maybeSingle() instead of single() to handle no results gracefully

  if (error) throw error
  return data // Will be null if no profile exists
}

/**
 * Create user profile
 * Called after first sign-in or when joining an organization
 */
export async function createProfile(data: {
  userId: string
  email: string
  organizationId: string
  fullName?: string
  role?: 'admin' | 'manager' | 'member'
}): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      id: data.userId,
      email: data.email,
      organization_id: data.organizationId,
      full_name: data.fullName,
      role: data.role || 'admin', // First user is admin
    })
    .select()
    .single()

  if (error) throw error
  return profile
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all profiles in an organization
 */
export async function getOrganizationProfiles(
  organizationId: string
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

