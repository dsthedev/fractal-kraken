import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import { useAuth } from 'src/auth'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'

const HomePage = () => {
  const { isAuthenticated } = useAuth()
  return (
    <>
      <Metadata title="Home" description="Home page" />

      <div className="flex flex-col items-center gap-12 my-12">
        <h1 className="text-3xl">{process.env.PROJECT_NAME}!</h1>
        {isAuthenticated ? (
          <Badge variant="secondary" className="px-4 py-2 text-lg">
            You are logged in!
          </Badge>
        ) : (
          <Button asChild size="lg" variant="secondary">
            <Link to={routes.login()}>Log In</Link>
          </Button>
        )}
      </div>
    </>
  )
}

export default HomePage
