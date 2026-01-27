import { useState, useRef, useMemo } from 'react'

import { Pencil, Trash2Icon } from 'lucide-react'
import type {
  DeleteMaterialMutation,
  DeleteMaterialMutationVariables,
  FindMaterials,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { ExportButton } from 'src/components/ExportButton/ExportButton'
import { QUERY } from 'src/components/Material/MaterialsCell'
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

const DELETE_MATERIAL_MUTATION: TypedDocumentNode<
  DeleteMaterialMutation,
  DeleteMaterialMutationVariables
> = gql`
  mutation DeleteMaterialMutation($id: Int!) {
    deleteMaterial(id: $id) {
      id
    }
  }
`

const IMPORT_MATERIALS_MUTATION: TypedDocumentNode<any, any> = gql`
  mutation ImportMaterials($data: [ImportMaterialInput!]!) {
    importMaterials(data: $data) {
      success
      message
      count
    }
  }
`

const DELETE_ALL_MATERIALS_MUTATION: TypedDocumentNode<any, any> = gql`
  mutation DeleteAllMaterials {
    deleteAllMaterials {
      success
      message
      count
    }
  }
`

type SortState = 'none' | 'asc' | 'desc'
type SortField = 'name' | 'usedIn'

const MaterialsList = ({ materials }: FindMaterials) => {
  const [deleteMaterial] = useMutation(DELETE_MATERIAL_MUTATION, {
    onCompleted: () => {
      toast.success('Material deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const [importMaterials] = useMutation(IMPORT_MATERIALS_MUTATION, {
    onCompleted: (data) => {
      toast.success(
        data.importMaterials.message +
          ` (${data.importMaterials.count} imported)`
      )
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const [deleteAllMaterials] = useMutation(DELETE_ALL_MATERIALS_MUTATION, {
    onCompleted: (data) => {
      toast.success(
        data.deleteAllMaterials.message +
          ` (${data.deleteAllMaterials.count} deleted)`
      )
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteMaterialMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete material ' + id + '?')) {
      deleteMaterial({ variables: { id } })
    }
  }

  const [nameSort, setNameSort] = useState<SortState>('none')
  const [usedInSort, setUsedInSort] = useState<SortState>('none')

  const sortedMaterials = useMemo(() => {
    if (nameSort === 'none' && usedInSort === 'none') return materials
    const copy = [...materials]
    copy.sort((a, b) => {
      if (nameSort !== 'none') {
        const na = (a.name || '').toLowerCase()
        const nb = (b.name || '').toLowerCase()
        if (na < nb) return nameSort === 'asc' ? -1 : 1
        if (na > nb) return nameSort === 'asc' ? 1 : -1
      }
      if (usedInSort !== 'none') {
        const ua = a.billableItems.length
        const ub = b.billableItems.length
        if (ua < ub) return usedInSort === 'asc' ? -1 : 1
        if (ua > ub) return usedInSort === 'asc' ? 1 : -1
      }
      return 0
    })
    return copy
  }, [nameSort, usedInSort, materials])

  const cycleNameSort = () => {
    setNameSort((s) => (s === 'none' ? 'asc' : s === 'asc' ? 'desc' : 'none'))
    setUsedInSort('none')
  }

  const cycleUsedInSort = () => {
    setUsedInSort((s) => (s === 'none' ? 'asc' : s === 'asc' ? 'desc' : 'none'))
    setNameSort('none')
  }

  const NameSortIcon = () => {
    if (nameSort === 'none') return null
    return nameSort === 'asc' ? ' ↑' : ' ↓'
  }

  const UsedInSortIcon = () => {
    if (usedInSort === 'none') return null
    return usedInSort === 'asc' ? ' ↑' : ' ↓'
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
      const data: any[] = []
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i]
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => (row[h] = (cols[idx] || '').trim()))
        const name = (row.name || '').trim()
        const description = (row.description || '').trim()
        if (name) data.push({ name, description })
      }
      if (data.length === 0) {
        toast.error('No valid materials found in CSV')
        return
      }
      importMaterials({ variables: { data } })
    } catch (err: any) {
      console.error('Import error', err)
      toast.error(`Import failed: ${err?.message || err}`)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleDeleteAll = () => deleteAllMaterials()

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr className="text-left">
            <th
              role="button"
              onClick={cycleNameSort}
              className="cursor-pointer select-none"
            >
              Name
              <NameSortIcon />
            </th>
            <th className="hidden md:flex">Description</th>
            <th
              role="button"
              onClick={cycleUsedInSort}
              className="cursor-pointer select-none"
            >
              Used In
              <UsedInSortIcon />
            </th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {sortedMaterials.map((material) => (
            <tr key={material.id}>
              <td>
                <Button variant="ghost" size="sm" className="text-lg" asChild>
                  <Link
                    to={routes.material({ id: material.id })}
                    title={'Show material ' + material.id}
                  >
                    {truncate(material.name)}
                  </Link>
                </Button>
              </td>
              <td className="hidden md:flex text-muted-foreground">
                {truncate(material.description)}
              </td>
              <td>
                {material.billableItems.length > 0 ? (
                  <span className="text-xl">
                    {material.billableItems.length}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">None</span>
                )}
              </td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.editMaterial({ id: material.id })}
                    title={'Edit material ' + material.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    <Pencil />
                  </Link>
                  <button
                    type="button"
                    title={'Delete material ' + material.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(material.id)}
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
          label="Export All Materials"
          data={sortedMaterials}
          filename={`${todayAsYYYYMMDD()}-materials.csv`}
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
          Import Materials
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="print:hidden">
              Delete All Materials
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all materials. Make sure to export a copy
                first. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteAll()}
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

export default MaterialsList
