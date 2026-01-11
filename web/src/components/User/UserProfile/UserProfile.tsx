import { useState } from 'react'

import { Eye, EyeOff } from 'lucide-react'

import { useAuth } from 'src/auth'

import ConnectedEntities from '../ConnectedEntities'

const UserProfile = () => {
  const { currentUser } = useAuth()
  const [isIdVisible, setIsIdVisible] = useState(false)

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* User Info Block */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">Profile Information</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-medium text-muted-foreground">Name:</span>
            <span>{currentUser.name || 'Not set'}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-medium text-muted-foreground">Email:</span>
            <span>{currentUser.email}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-medium text-muted-foreground">Role:</span>
            <span className="capitalize">{currentUser.roles}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-medium text-muted-foreground">User ID:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {isIdVisible
                  ? currentUser.id
                  : currentUser.id.substring(0, 4) +
                    '••••••••••••••••••••••••••••••'}
              </span>
              <button
                onClick={() => setIsIdVisible(!isIdVisible)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isIdVisible ? 'Hide ID' : 'Show ID'}
              >
                {isIdVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Entities Block */}
      <ConnectedEntities />
    </div>
  )
}

export default UserProfile
