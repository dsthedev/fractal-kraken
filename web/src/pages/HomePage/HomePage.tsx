// import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import { Badge } from 'src/components/ui/badge'

const HomePage = () => {
  return (
    <>
      <Metadata title="Home" description="Home page" />

      <div className="flex flex-col items-center gap-12 my-12">
        <h1 className="text-3xl">Welcome to {process.env.PROJECT_NAME}!</h1>
        <p>Stay a while, and listen.</p>
      </div>
    </>
  )
}

export default HomePage
