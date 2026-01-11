import { Metadata } from '@cedarjs/web'

import UserProfile from 'src/components/User/UserProfile'

const DashboardPage = () => {
  return (
    <>
      <Metadata title="Dashboard" description="Dashboard page" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
        <UserProfile />
      </div>
    </>
  )
}

export default DashboardPage
