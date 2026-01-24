import { Metadata } from '@cedarjs/web'

import SampleHomePage from 'src/components/SampleHomePage/SampleHomePage'

const HomePage = () => {
  return (
    <>
      <Metadata title="Home" description="Home page" />

      <div className="flex flex-col items-center gap-12 my-12">
        <SampleHomePage />
      </div>
    </>
  )
}

export default HomePage
