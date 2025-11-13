/**
 * Shared Types for CallTree
 * Used across web and mobile applications
 */

export * from './database.types'

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: ApiError
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Auth Types
export interface AuthUser {
  id: string
  email: string
  fullName?: string
  role: 'admin' | 'manager' | 'member'
  organizationId?: string
  avatarUrl?: string
}

// Notification Types
export interface NotificationPayload {
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  data?: {
    notificationId: string
    treeId: string
    logId: string
    [key: string]: any
  }
}

// Tree Builder Types (for visual editor)
export interface TreeNodeData {
  id: string
  userId: string
  userName: string
  userEmail: string
  level: number
  position: number
  backupUserId?: string
  backupUserName?: string
}

export interface TreeEdge {
  id: string
  source: string
  target: string
}

// Dashboard Stats Types
export interface DashboardStats {
  totalTrees: number
  activeTrees: number
  totalNotifications: number
  activeNotifications: number
  totalMembers: number
  responseRate: number
}

// Notification Analytics
export interface NotificationAnalytics {
  notificationId: string
  title: string
  totalRecipients: number
  sent: number
  delivered: number
  acknowledged: number
  failed: number
  timeout: number
  averageResponseTime: number
  levelProgress: {
    level: number
    total: number
    acknowledged: number
    pending: number
  }[]
}

