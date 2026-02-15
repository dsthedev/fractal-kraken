import { Metadata } from '@cedarjs/web'

import OrphanedBillableItemsCell from './OrphanedBillableItemsCell'

const OrphanedBillableItemsCleanupPage = () => {
  return (
    <>
      <Metadata
        title="Orphaned Billable Items Cleanup"
        description="Clean up orphaned billable items with no valid estimate, invoice, or author"
      />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Orphaned Billable Items Cleanup
          </h1>
          <p className="text-gray-600 mt-2">
            Remove billable items that have no associated estimate, invoice, or
            author.
          </p>
        </div>

        <OrphanedBillableItemsCell />
      </div>
    </>
  )
}

export default OrphanedBillableItemsCleanupPage
