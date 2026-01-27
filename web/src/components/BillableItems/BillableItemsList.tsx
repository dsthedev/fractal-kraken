import type { BillableItem } from 'types/graphql'

interface BillableItemsListProps {
  items: BillableItem[]
  displayCount?: boolean
}

export const BillableItemsList = ({
  items,
  displayCount = false,
}: BillableItemsListProps) => {
  const count = items.length

  if (displayCount) {
    return <div className="mt-4">[{count}] billable items have this action</div>
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2">Billable Items ({count})</h3>
      {count === 0 ? (
        <p className="text-sm text-gray-500">No billable items found</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="text-sm border-l-2 border-gray-300 pl-2"
            >
              {item.notes || `$${item.unitPrice} - Qty: ${item.quantity}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
