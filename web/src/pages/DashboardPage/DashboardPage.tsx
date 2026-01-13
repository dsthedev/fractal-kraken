import { useState } from 'react'

import { Edit } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import { Button } from 'src/components/ui/button'
import EditUserProfile from 'src/components/User/EditUserProfile'
import UserProfile from 'src/components/User/UserProfile'

const DashboardPage = () => {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <Metadata title="Dashboard" description="Dashboard page" />

      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Edit profile"
            >
              <Edit size={20} />
            </Button>
          )}
        </div>
        {isEditing ? (
          <EditUserProfile onDone={() => setIsEditing(false)} />
        ) : (
          <UserProfile />
        )}
      </div>
      <div className="w-fit mx-auto text-center">
        <p className="text-sm leading-8">
          After setting up your profile, add and edit your{' '}
          <Button variant="outline" size="sm" asChild>
            <Link to={routes.rates()}>Rates</Link>
          </Button>
          <hr className="my-6" />
          If you already have rates set up, you can start managing{' '}
          <Button variant="outline" size="sm" asChild>
            <Link to={routes.estimates()}>Estimates</Link>
          </Button>
          .
        </p>
      </div>
    </>
  )
}

export default DashboardPage
