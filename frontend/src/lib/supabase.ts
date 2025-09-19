import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:8000'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})


// Types for our user system
export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'supervisor'
  | 'operator'
  | 'technician'
  | 'quality'
  | 'readonly'

export type AccessLevel = 'none' | 'read' | 'write' | 'admin'

export interface UserProfile {
  id: string
  username?: string
  email: string
  full_name?: string
  role: UserRole
  department?: string
  shift?: string
  phone?: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface LinePermission {
  id: string
  user_id: string
  line_id: string
  access_level: AccessLevel
  created_at: string
}

export interface MachinePermission {
  id: string
  user_id: string
  machine_id: string
  line_id: string
  access_level: AccessLevel
  created_at: string
}

export interface DataPermission {
  id: string
  user_id: string
  category: string // 'production', 'quality', 'maintenance', 'recipes', 'alerts'
  access_level: AccessLevel
  created_at: string
}

// Permission checking functions
export const checkLineAccess = async (lineId: string, requiredLevel: AccessLevel = 'read'): Promise<boolean> => {
  const { data, error } = await supabase.rpc('user_has_line_access', {
    line_id: lineId,
    required_level: requiredLevel
  })
  
  if (error) {
    console.error('Error checking line access:', error)
    return false
  }
  
  return data
}

export const checkMachineAccess = async (machineId: string, requiredLevel: AccessLevel = 'read'): Promise<boolean> => {
  const { data, error } = await supabase.rpc('user_has_machine_access', {
    machine_id: machineId,
    required_level: requiredLevel
  })
  
  if (error) {
    console.error('Error checking machine access:', error)
    return false
  }
  
  return data
}

export const checkDataAccess = async (category: string, requiredLevel: AccessLevel = 'read'): Promise<boolean> => {
  const { data, error } = await supabase.rpc('user_has_data_access', {
    category: category,
    required_level: requiredLevel
  })
  
  if (error) {
    console.error('Error checking data access:', error)
    return false
  }
  
  return data
}

// Role-based access helpers
export const hasRole = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole)
}

export const isAdmin = (userRole: UserRole): boolean => {
  return hasRole(userRole, ['super_admin', 'admin'])
}

export const canManageUsers = (userRole: UserRole): boolean => {
  return hasRole(userRole, ['super_admin', 'admin'])
}

export const canViewProduction = (userRole: UserRole): boolean => {
  return hasRole(userRole, ['super_admin', 'admin', 'supervisor', 'operator'])
}

export const canViewQuality = (userRole: UserRole): boolean => {
  return hasRole(userRole, ['super_admin', 'admin', 'supervisor', 'quality'])
}

export const canViewMaintenance = (userRole: UserRole): boolean => {
  return hasRole(userRole, ['super_admin', 'admin', 'supervisor', 'technician'])
}

export const canEditConfiguration = (userRole: UserRole): boolean => {
  return hasRole(userRole, ['super_admin', 'admin'])
}
