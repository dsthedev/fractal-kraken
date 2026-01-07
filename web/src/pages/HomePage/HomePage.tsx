// import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import { Badge } from 'src/components/ui/badge'

const HomePage = () => {
  return (
    <>
      <Metadata title="Home" description="Home page" />

      <h1 className="text-3xl">Home Page</h1>
      <p>
        If <Badge variant="secondary">shadcn/ui</Badge> has a badge style, it is
        installed.
      </p>
    </>
  )
}

export default HomePage
