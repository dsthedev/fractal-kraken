import { useAuth } from 'src/auth'
import ConnectedEntities from '../ConnectedEntities'

const UserProfile = () => {
  const { currentUser } = useAuth()

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
            <span className="font-mono text-sm">{currentUser.id}</span>
          </div>
        </div>
      </div>

      {/* Connected Entities Block */}
      <ConnectedEntities />
    </div>
  )
}

export default UserProfile
