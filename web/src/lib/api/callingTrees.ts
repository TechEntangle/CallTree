/**
 * Calling Trees API Functions
 * Handles calling tree creation and management
 */

import { supabase } from '../supabase'
import type { Database } from '../../../../shared/types/database.types'

type CallingTree = Database['public']['Tables']['calling_trees']['Row']
type CallingTreeInsert = Database['public']['Tables']['calling_trees']['Insert']
type CallingTreeUpdate = Database['public']['Tables']['calling_trees']['Update']

type TreeNode = Database['public']['Tables']['tree_nodes']['Row']
type TreeNodeInsert = Database['public']['Tables']['tree_nodes']['Insert']

/**
 * Get all calling trees for an organization
 */
export async function getCallingTrees(
  organizationId: string
): Promise<CallingTree[]> {
  const { data, error } = await supabase
    .from('calling_trees')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get a single calling tree by ID
 */
export async function getCallingTree(
  treeId: string
): Promise<CallingTree | null> {
  const { data, error } = await supabase
    .from('calling_trees')
    .select('*')
    .eq('id', treeId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

/**
 * Create a new calling tree
 */
export async function createCallingTree(data: {
  organizationId: string
  name: string
  description?: string
  timeoutSeconds?: number
  createdBy: string
}): Promise<CallingTree> {
  const { data: tree, error } = await supabase
    .from('calling_trees')
    .insert({
      organization_id: data.organizationId,
      name: data.name,
      description: data.description,
      timeout_seconds: data.timeoutSeconds || 300,
      created_by: data.createdBy,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw error
  return tree
}

/**
 * Update a calling tree
 */
export async function updateCallingTree(
  treeId: string,
  updates: CallingTreeUpdate
): Promise<CallingTree> {
  const { data, error } = await supabase
    .from('calling_trees')
    .update(updates)
    .eq('id', treeId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a calling tree
 */
export async function deleteCallingTree(treeId: string): Promise<void> {
  const { error } = await supabase
    .from('calling_trees')
    .delete()
    .eq('id', treeId)

  if (error) throw error
}

/**
 * Get tree nodes for a calling tree
 */
export async function getTreeNodes(treeId: string): Promise<TreeNode[]> {
  const { data, error } = await supabase
    .from('tree_nodes')
    .select(`
      *,
      user:profiles!tree_nodes_user_id_fkey(id, full_name, email),
      backup:profiles!tree_nodes_backup_user_id_fkey(id, full_name, email)
    `)
    .eq('tree_id', treeId)
    .order('level', { ascending: true })
    .order('position', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Create a tree node
 */
export async function createTreeNode(data: {
  treeId: string
  userId: string
  level: number
  position: number
  parentNodeId?: string
  backupUserId?: string
}): Promise<TreeNode> {
  const { data: node, error } = await supabase
    .from('tree_nodes')
    .insert({
      tree_id: data.treeId,
      user_id: data.userId,
      level: data.level,
      position: data.position,
      parent_node_id: data.parentNodeId,
      backup_user_id: data.backupUserId,
    })
    .select()
    .single()

  if (error) throw error
  return node
}

/**
 * Update a tree node
 */
export async function updateTreeNode(
  nodeId: string,
  updates: {
    userId?: string
    level?: number
    position?: number
    parentNodeId?: string | null
    backupUserId?: string | null
  }
): Promise<TreeNode> {
  const { data, error } = await supabase
    .from('tree_nodes')
    .update({
      user_id: updates.userId,
      level: updates.level,
      position: updates.position,
      parent_node_id: updates.parentNodeId,
      backup_user_id: updates.backupUserId,
    })
    .eq('id', nodeId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a tree node
 */
export async function deleteTreeNode(nodeId: string): Promise<void> {
  const { error } = await supabase.from('tree_nodes').delete().eq('id', nodeId)

  if (error) throw error
}

/**
 * Activate a calling tree (set status to active)
 */
export async function activateCallingTree(treeId: string): Promise<CallingTree> {
  return updateCallingTree(treeId, { status: 'active' })
}

/**
 * Archive a calling tree
 */
export async function archiveCallingTree(treeId: string): Promise<CallingTree> {
  return updateCallingTree(treeId, { status: 'archived' })
}

