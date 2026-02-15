import { useState } from 'react'

import { gql } from '@apollo/client'
import { EyeIcon, PencilIcon, TrashIcon } from 'lucide-react'
import type {
  DeleteOrphanedBillableItemsMutation,
  DeleteOrphanedBillableItemsMutationVariables,
  FindOrphanedBillableItems,
} from 'types/graphql'

import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'src/components/ui/alert-dialog'
import { Button } from 'src/components/ui/button'
import { Checkbox } from 'src/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table'

import { QUERY } from './OrphanedBillableItemsCell'

const DELETE_ORPHANED_BILLABLE_ITEMS_MUTATION: TypedDocumentNode<
  DeleteOrphanedBillableItemsMutation,
  DeleteOrphanedBillableItemsMutationVariables
> = gql`
  mutation DeleteOrphanedBillableItemsMutation($ids: [Int!]!) {
    deleteOrphanedBillableItems(ids: $ids)
  }
`

type BillableItem = FindOrphanedBillableItems['orphanedBillableItems'][0]

interface OrphanedBillableItemsListProps {
  items: BillableItem[]
}

export const OrphanedBillableItemsList = ({
  items,
}: OrphanedBillableItemsListProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [deleteItems] = useMutation(DELETE_ORPHANED_BILLABLE_ITEMS_MUTATION, {
    onCompleted: () => {
      toast.success('Billable items deleted')
      setSelectedIds([])
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((item) => item.id))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return
    deleteItems({ variables: { ids: selectedIds } })
  }

  const handleDeleteItem = (id: number) => {
    deleteItems({ variables: { ids: [id] } })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Found {items.length} orphaned billable item
          {items.length !== 1 ? 's' : ''}
        </p>

        {selectedIds.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete {selectedIds.length} Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Delete Selected Items?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to permanently delete {selectedIds.length}{' '}
                billable item{selectedIds.length !== 1 ? 's' : ''}. This action
                cannot be undone.
              </AlertDialogDescription>
              <div className="flex justify-end gap-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected}>
                  Delete
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No orphaned billable items found.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedIds.length === items.length && items.length > 0
                    }
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < items.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Context</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.action?.name || '—'}
                  </TableCell>
                  <TableCell>{item.material?.name || '—'}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {item.notes || '—'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${parseFloat(item.subtotal).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="flex justify-end gap-2">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
