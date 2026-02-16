// import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import NewPlankIncrementor from 'src/components/Tools/PlankIncrementor/NewPlankIncrementor'

const PlankIncrementorPage = () => {
  return (
    <>
      <Metadata title="PlankIncrementor" description="PlankIncrementor page" />

      <NewPlankIncrementor />
    </>
  )
}

export default PlankIncrementorPage
