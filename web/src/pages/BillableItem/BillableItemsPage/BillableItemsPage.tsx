import { useState } from 'react'

import BillableItemsPaginatedCell from 'src/components/BillableItem/BillableItemsPaginatedCell'

const BillableItemsPage = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  return (
    <BillableItemsPaginatedCell
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
    />
  )
}

export default BillableItemsPage
