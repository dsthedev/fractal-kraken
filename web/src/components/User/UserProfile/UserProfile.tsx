import { useState } from 'react'

import { Eye, EyeOff } from 'lucide-react'

import { useAuth } from 'src/auth'

const UserProfile = () => {
  const { currentUser } = useAuth()
  const [isIdVisible, setIsIdVisible] = useState(false)

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">Profile Information</h2>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3">
            <span className="font-medium text-muted-foreground md:w-28 md:flex-shrink">
              Name:
            </span>
            <span>{currentUser.name || 'Not set'}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3">
            <span className="font-medium text-muted-foreground md:w-28 md:flex-shrink">
              Email:
            </span>
            <span>{currentUser.email}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3">
            <span className="font-medium text-muted-foreground md:w-28 md:flex-shrink">
              Role:
            </span>
            <span className="capitalize">{currentUser.roles}</span>
          </div>

          <div className="flex flex-col gap-1 md:gap-3">
            <span className="font-medium text-muted-foreground md:w-28 md:flex-shrink">
              User ID:
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-sm truncate">
                {isIdVisible
                  ? currentUser.id
                  : currentUser.id.substring(0, 4) +
                    '••••••••••••••••••••••••••••••'}
              </span>
              <button
                onClick={() => setIsIdVisible(!isIdVisible)}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                aria-label={isIdVisible ? 'Hide ID' : 'Show ID'}
              >
                {isIdVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
