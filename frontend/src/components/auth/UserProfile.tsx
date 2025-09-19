import React, { useState } from 'react'
import { useAuth } from '../../contexts/SupabaseAuthContext'
import { 
  UserIcon, 
  ShieldCheckIcon, 
  BuildingOfficeIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const UserProfile: React.FC = () => {
  const { profile, signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    await signOut()
    setIsLoggingOut(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'supervisor':
        return 'bg-blue-100 text-blue-800'
      case 'operator':
        return 'bg-green-100 text-green-800'
      case 'technician':
        return 'bg-yellow-100 text-yellow-800'
      case 'quality':
        return 'bg-indigo-100 text-indigo-800'
      case 'readonly':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Full system access and user management'
      case 'admin':
        return 'Line management and user administration'
      case 'supervisor':
        return 'Production monitoring and configuration'
      case 'operator':
        return 'Basic dashboard and production access'
      case 'technician':
        return 'Machine diagnostics and maintenance'
      case 'quality':
        return 'Quality data and inspection results'
      case 'readonly':
        return 'View-only access to permitted areas'
      default:
        return 'Standard user access'
    }
  }

  if (!profile) {
    return (
      <div className="p-4 text-center text-gray-500">
        No user profile available
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
        <button
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {profile.full_name || 'No name set'}
            </h3>
            <p className="text-gray-600">{profile.email}</p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(profile.role)}`}>
              <ShieldCheckIcon className="w-3 h-3 mr-1" />
              {profile.role.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Role Description */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Role Permissions</h4>
          <p className="text-sm text-gray-600">{getRoleDescription(profile.role)}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.department && (
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Department</p>
                <p className="text-sm text-gray-600">{profile.department}</p>
              </div>
            </div>
          )}

          {profile.shift && (
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Shift</p>
                <p className="text-sm text-gray-600">{profile.shift}</p>
              </div>
            </div>
          )}

          {profile.phone && (
            <div className="flex items-center space-x-3">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <p className="text-sm text-gray-600">{profile.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Account Status:</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {profile.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {profile.last_login && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Last Login:</span>
              <span className="text-gray-900">
                {new Date(profile.last_login).toLocaleString()}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Member Since:</span>
            <span className="text-gray-900">
              {new Date(profile.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Access Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Access Guide</h4>
          <div className="space-y-1 text-xs text-blue-800">
            {profile.role === 'super_admin' && (
              <p>• Full access to all systems, users, and configurations</p>
            )}
            {(['super_admin', 'admin'] as const).includes(profile.role as any) && (
              <>
                <p>• User management and role assignment</p>
                <p>• Line configuration and machine setup</p>
              </>
            )}
            {(['super_admin', 'admin', 'supervisor'] as const).includes(profile.role as any) && (
              <>
                <p>• Production monitoring and analytics</p>
                <p>• Alert management and notifications</p>
              </>
            )}
            {profile.role === 'operator' && (
              <p>• Dashboard access and basic production data</p>
            )}
            {profile.role === 'technician' && (
              <p>• Machine diagnostics and maintenance records</p>
            )}
            {profile.role === 'quality' && (
              <p>• Quality data and inspection results</p>
            )}
            {profile.role === 'readonly' && (
              <p>• View-only access to permitted information</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
