/**
 * Team Members API Functions
 * Handles organization member management
 */

import { supabase } from '../supabase'
import type { Database } from '../../../../shared/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

/**
 * Get all team members in an organization
 */
export async function getTeamMembers(
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

/**
 * Get a single team member by ID
 */
export async function getTeamMember(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Update a team member's role
 */
export async function updateMemberRole(
  userId: string,
  role: 'admin' | 'member' | 'viewer'
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Remove a team member from organization
 * (Sets organization_id to null)
 */
export async function removeMemberFromOrganization(
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ organization_id: null, role: 'member' })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Get team member statistics
 */
export async function getTeamStats(organizationId: string): Promise<{
  total: number
  admins: number
  members: number
  viewers: number
}> {
  const members = await getTeamMembers(organizationId)

  return {
    total: members.length,
    admins: members.filter((m) => m.role === 'admin').length,
    members: members.filter((m) => m.role === 'member').length,
    viewers: members.filter((m) => m.role === 'viewer').length,
  }
}

/**
 * Check if user is admin in their organization
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const profile = await getTeamMember(userId)
  return profile?.role === 'admin'
}

/**
 * Get all users without an organization (pending users)
 */
export async function getPendingUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .is('organization_id', null)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Add a user to an organization
 */
export async function addUserToOrganization(
  userId: string,
  organizationId: string,
  role: 'admin' | 'member' | 'viewer' = 'member'
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      organization_id: organizationId,
      role: role,
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

