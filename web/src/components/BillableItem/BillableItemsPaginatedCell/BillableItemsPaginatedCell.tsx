import { Link, routes } from '@cedarjs/router'
import type { TypedDocumentNode } from '@cedarjs/web'
import type { CellSuccessProps, CellFailureProps } from '@cedarjs/web'

import BillableItems from 'src/components/BillableItem/BillableItems'
import { Button } from 'src/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select'

type BillableItemsPageQuery = {
  billableItemsPage: {
    billableItems: any[]
    count: number
    hasMore: boolean
    page: number
    pageSize: number
  }
}

type BillableItemsPageVariables = {
  page?: number
  pageSize?: number
}

export const QUERY: TypedDocumentNode<
  BillableItemsPageQuery,
  BillableItemsPageVariables
> = gql`
  query FindBillableItemsPaginated($page: Int, $pageSize: Int) {
    billableItemsPage(page: $page, pageSize: $pageSize) {
      billableItems {
        id
        actionId
        action {
          id
          name
        }
        materialId
        material {
          id
          name
        }
        unitId
        unit {
          id
          fullName
          shortName
        }
        unitPrice
        pricingType
        quantity
        subtotal
        estimatedMinutesPerUnit
        notes
        authorId
        createdAt
        updatedAt
      }
      count
      hasMore
      page
      pageSize
    }
  }
`

export const Loading = () => (
  <div className="flex justify-center py-8">
    <div className="text-muted-foreground">Loading billable items...</div>
  </div>
)

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No billableItems yet.{' '}
      <Link to={routes.newBillableItem()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

type SuccessProps = CellSuccessProps<
  BillableItemsPageQuery,
  BillableItemsPageVariables
> & {
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export const Success = ({
  billableItemsPage,
  queryResult,
  onPageChange,
  onPageSizeChange,
}: SuccessProps) => {
  const { billableItems, count, page, pageSize, hasMore } = billableItemsPage

  const totalPages = Math.ceil(count / pageSize)

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage)
    queryResult?.refetch({ page: newPage, pageSize })
  }

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize, 10)
    onPageSizeChange(size)
    onPageChange(1)
    queryResult?.refetch({ page: 1, pageSize: size })
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          Showing {(page - 1) * pageSize + 1} to{' '}
          {Math.min(page * pageSize, count)} of {count} items
        </div>
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <BillableItems billableItems={billableItems} />

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
        >
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={!hasMore}
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
        >
          Last
        </Button>
      </div>
    </div>
  )
}
