import React from 'react'
import { useAuth } from '../../contexts/SupabaseAuthContext'

type UserRole = 'super_admin' | 'admin' | 'supervisor' | 'operator' | 'technician' | 'quality' | 'readonly'

interface PermissionGuardProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  requiredDataAccess?: string[] // data categories like 'production', 'quality'
  fallback?: React.ReactNode
  showFallback?: boolean
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRoles = [],
  requiredDataAccess = [],
  fallback = null,
  showFallback = false
}) => {
  const { profile, hasRole } = useAuth()

  // If no user profile, don't show anything
  if (!profile) {
    return showFallback ? <>{fallback}</> : null
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return showFallback ? <>{fallback}</> : null
  }

  // For now, we'll implement data access checking later when we integrate with the backend
  // This is a placeholder for future data category permissions
  if (requiredDataAccess.length > 0) {
    // TODO: Implement data category access checking
    // For now, allow access based on role
    const hasDataAccess = requiredDataAccess.some(category => {
      switch (category) {
        case 'production':
          return hasRole(['super_admin', 'admin', 'supervisor', 'operator'])
        case 'quality':
          return hasRole(['super_admin', 'admin', 'supervisor', 'quality'])
        case 'maintenance':
          return hasRole(['super_admin', 'admin', 'supervisor', 'technician'])
        case 'configuration':
          return hasRole(['super_admin', 'admin'])
        case 'users':
          return hasRole(['super_admin', 'admin'])
        default:
          return hasRole(['super_admin'])
      }
    })

    if (!hasDataAccess) {
      return showFallback ? <>{fallback}</> : null
    }
  }

  return <>{children}</>
}

// Specific permission components for common use cases
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard requiredRoles={['super_admin', 'admin']} fallback={fallback}>
    {children}
  </PermissionGuard>
)

export const SupervisorPlus: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard requiredRoles={['super_admin', 'admin', 'supervisor']} fallback={fallback}>
    {children}
  </PermissionGuard>
)

export const ProductionAccess: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard 
    requiredRoles={['super_admin', 'admin', 'supervisor', 'operator']} 
    requiredDataAccess={['production']}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
)

export const QualityAccess: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard 
    requiredRoles={['super_admin', 'admin', 'supervisor', 'quality']} 
    requiredDataAccess={['quality']}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
)

export const MaintenanceAccess: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard 
    requiredRoles={['super_admin', 'admin', 'supervisor', 'technician']} 
    requiredDataAccess={['maintenance']}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
)

export const ConfigurationAccess: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard 
    requiredRoles={['super_admin', 'admin']} 
    requiredDataAccess={['configuration']}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
)
