/**
 * Organization API Functions
 * Handles organization creation and management
 */

import { supabase } from '../supabase'
import type { Database } from '../../../../shared/types/database.types'

type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']

/**
 * Create a new organization
 */
export async function createOrganization(data: {
  name: string
  slug: string
  settings?: any
}): Promise<Organization> {
  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name: data.name,
      slug: data.slug,
      settings: data.settings || {},
    })
    .select()
    .single()

  if (error) throw error
  return org
}

/**
 * Get organization by ID
 */
export async function getOrganization(
  organizationId: string
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

/**
 * Update organization
 */
export async function updateOrganization(
  organizationId: string,
  updates: {
    name?: string
    slug?: string
    settings?: any
  }
): Promise<Organization> {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Check if slug is available
 */
export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data === null
}

/**
 * Generate a slug from organization name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

