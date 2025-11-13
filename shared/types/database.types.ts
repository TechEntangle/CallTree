/**
 * Database Types for CallTree
 * Auto-generated types matching Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'manager' | 'member'
export type TreeStatus = 'draft' | 'active' | 'archived'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type NotificationStatus = 'pending' | 'in_progress' | 'completed' | 'failed'
export type NotificationLogStatus = 'pending' | 'sent' | 'delivered' | 'acknowledged' | 'failed' | 'timeout' | 'escalated'
export type DocumentCategory = 'general' | 'evacuation' | 'procedures' | 'contacts' | 'maps'
export type DeviceType = 'ios' | 'android' | 'web'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          email: string
          full_name: string | null
          phone: string | null
          role: UserRole
          avatar_url: string | null
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          email: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      calling_trees: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          status: TreeStatus
          timeout_seconds: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          status?: TreeStatus
          timeout_seconds?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          status?: TreeStatus
          timeout_seconds?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tree_nodes: {
        Row: {
          id: string
          tree_id: string
          parent_node_id: string | null
          user_id: string | null
          level: number
          position: number
          backup_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          parent_node_id?: string | null
          user_id?: string | null
          level?: number
          position?: number
          backup_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tree_id?: string
          parent_node_id?: string | null
          user_id?: string | null
          level?: number
          position?: number
          backup_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          tree_id: string
          organization_id: string
          title: string
          message: string
          priority: Priority
          status: NotificationStatus
          initiated_by: string | null
          initiated_at: string
          completed_at: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          tree_id: string
          organization_id: string
          title: string
          message: string
          priority?: Priority
          status?: NotificationStatus
          initiated_by?: string | null
          initiated_at?: string
          completed_at?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          tree_id?: string
          organization_id?: string
          title?: string
          message?: string
          priority?: Priority
          status?: NotificationStatus
          initiated_by?: string | null
          initiated_at?: string
          completed_at?: string | null
          metadata?: Json
        }
      }
      notification_logs: {
        Row: {
          id: string
          notification_id: string
          node_id: string
          user_id: string
          level: number
          status: NotificationLogStatus
          sent_at: string | null
          delivered_at: string | null
          acknowledged_at: string | null
          response: string | null
          escalated_to: string | null
          created_at: string
        }
        Insert: {
          id?: string
          notification_id: string
          node_id: string
          user_id: string
          level: number
          status?: NotificationLogStatus
          sent_at?: string | null
          delivered_at?: string | null
          acknowledged_at?: string | null
          response?: string | null
          escalated_to?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          notification_id?: string
          node_id?: string
          user_id?: string
          level?: number
          status?: NotificationLogStatus
          sent_at?: string | null
          delivered_at?: string | null
          acknowledged_at?: string | null
          response?: string | null
          escalated_to?: string | null
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          organization_id: string
          title: string
          description: string | null
          file_url: string
          file_type: string | null
          file_size: number | null
          category: DocumentCategory
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          description?: string | null
          file_url: string
          file_type?: string | null
          file_size?: number | null
          category?: DocumentCategory
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          description?: string | null
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          category?: DocumentCategory
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      push_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          device_type: DeviceType | null
          device_name: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          device_type?: DeviceType | null
          device_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          device_type?: DeviceType | null
          device_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

