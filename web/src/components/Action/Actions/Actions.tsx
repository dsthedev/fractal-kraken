import { useState, useRef, useMemo } from 'react'

import { Pencil, Trash2Icon } from 'lucide-react'
import type {
  DeleteActionMutation,
  DeleteActionMutationVariables,
  FindActions,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/Action/ActionsCell'
import { ExportButton } from 'src/components/ExportButton/ExportButton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'src/components/ui/alert-dialog'
import { Button } from 'src/components/ui/button'
import { parseCSV } from 'src/lib/csvParse'
import { truncate } from 'src/lib/formatters'
import { todayAsYYYYMMDD } from 'src/lib/utils'

const DELETE_ACTION_MUTATION: TypedDocumentNode<
  DeleteActionMutation,
  DeleteActionMutationVariables
> = gql`
  mutation DeleteActionMutation($id: Int!) {
    deleteAction(id: $id) {
      id
    }
  }
`

const CREATE_ACTION_MUTATION: TypedDocumentNode<any, any> = gql`
  mutation CreateAction($input: CreateActionInput!) {
    createAction(input: $input) {
      id
      name
    }
  }
`

type SortState = 'none' | 'asc' | 'desc'

const ActionsList = ({ actions }: FindActions) => {
  const [deleteAction] = useMutation(DELETE_ACTION_MUTATION, {
    onCompleted: () => {
      toast.success('Action deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteActionMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete action ' + id + '?')) {
      deleteAction({ variables: { id } })
    }
  }

  const [nameSort, setNameSort] = useState<SortState>('none')
  const originalRef = useRef(actions)

  // Keep originalRef in sync when actions prop changes (e.g., search filter)
  if (originalRef.current !== actions) {
    originalRef.current = actions
  }

  const sortedActions = useMemo(() => {
    if (nameSort === 'none') return originalRef.current
    const copy = [...originalRef.current]
    copy.sort((a, b) => {
      const na = (a.name || '').toLowerCase()
      const nb = (b.name || '').toLowerCase()
      if (na < nb) return nameSort === 'asc' ? -1 : 1
      if (na > nb) return nameSort === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [nameSort, actions])

  const cycleNameSort = () => {
    setNameSort((s) => (s === 'none' ? 'asc' : s === 'asc' ? 'desc' : 'none'))
  }

  // Export / Import / Delete All controls
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [createAction] = useMutation(CREATE_ACTION_MUTATION, {
    onCompleted: () => {},
    onError: () => {},
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (!rows || rows.length < 2) {
        toast.error('CSV must have header and at least one data row')
        return
      }

      const headers = rows[0].map((h) => h.trim())
      let imported = 0
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i]
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => (row[h] = (cols[idx] || '').trim()))
        const name = (row.name || row.action || '').trim()
        const description = (row.description || '').trim()
        if (name) {
          await createAction({ variables: { input: { name, description } } })
          imported++
        }
      }
      toast.success(`Imported ${imported} actions`)
    } catch (err: any) {
      console.error('Import error', err)
      toast.error(`Import failed: ${err?.message || err}`)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const deleteAll = async () => {
    try {
      // Use the existing deleteAction mutation for each action but silence per-item toasts
      const promises: Promise<any>[] = []
      for (const a of actions) {
        promises.push(
          // call mutation without awaiting the onCompleted toast handler
          deleteAction({ variables: { id: a.id } })
        )
      }
      await Promise.all(promises)
      toast.success(`Deleted ${actions.length} actions`)
    } catch (err: any) {
      console.error('Delete all error', err)
      toast.error(`Failed to delete all actions: ${err?.message || err}`)
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr className="text-left text-xs text-muted">
            {/* <th>Id</th> */}
            <th
              role="button"
              onClick={cycleNameSort}
              className="cursor-pointer select-none"
              title="Sort by name: cycle asc → desc → default"
            >
              Name
              {nameSort !== 'none' && (
                <span className="ml-2 text-muted">
                  {nameSort === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
            <th className="hidden md:flex">Description</th>
            {/* <th>Created at</th>
            <th>Updated at</th> */}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {sortedActions.map((action) => (
            <tr key={action.id}>
              {/* <td>{truncate(action.id)}</td> */}
              <td>
                <Button variant="ghost" size="sm" className="text-lg" asChild>
                  <Link
                    to={routes.action({ id: action.id })}
                    title={'Show action ' + action.id + ' detail'}
                  >
                    {truncate(action.name)}
                  </Link>
                </Button>
              </td>
              <td className="hidden md:flex text-muted-foreground">
                {truncate(action.description)}
              </td>
              {/* <td>{timeTag(action.createdAt)}</td>
              <td>{timeTag(action.updatedAt)}</td> */}
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.editAction({ id: action.id })}
                    title={'Edit action ' + action.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    <Pencil />
                  </Link>
                  <button
                    type="button"
                    title={'Delete action ' + action.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(action.id)}
                  >
                    <Trash2Icon />
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="mb-6" />
      <div className="flex flex-col md:flex-row gap-2">
        <ExportButton
          label="Export All Actions"
          data={originalRef.current}
          filename={`${todayAsYYYYMMDD()}-actions.csv`}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImportFile}
          style={{ display: 'none' }}
        />
        <Button
          className="print:hidden"
          variant="outline"
          size="sm"
          onClick={handleImportClick}
        >
          Import Actions
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="print:hidden">
              Delete All Actions
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all actions. Make sure to export a copy first.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAll()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default ActionsList
