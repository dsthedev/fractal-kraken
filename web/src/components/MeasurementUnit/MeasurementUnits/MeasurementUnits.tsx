import { useRef, type ChangeEvent } from 'react'

import type {
  DeleteMeasurementUnitMutation,
  DeleteMeasurementUnitMutationVariables,
  FindMeasurementUnits,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { ExportButton } from 'src/components/ExportButton/ExportButton'
import { QUERY } from 'src/components/MeasurementUnit/MeasurementUnitsCell'
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
import { truncate } from 'src/lib/formatters.js'
import { todayAsYYYYMMDD } from 'src/lib/utils'

const DELETE_MEASUREMENT_UNIT_MUTATION: TypedDocumentNode<
  DeleteMeasurementUnitMutation,
  DeleteMeasurementUnitMutationVariables
> = gql`
  mutation DeleteMeasurementUnitMutation($id: Int!) {
    deleteMeasurementUnit(id: $id) {
      id
    }
  }
`

const MeasurementUnitsList = ({ measurementUnits }: FindMeasurementUnits) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [deleteMeasurementUnit] = useMutation(
    DELETE_MEASUREMENT_UNIT_MUTATION,
    {
      onCompleted: () => {
        toast.success('MeasurementUnit deleted')
      },
      onError: (error) => {
        toast.error(error.message)
      },
      // This refetches the query on the list page. Read more about other ways to
      // update the cache over here:
      // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
      refetchQueries: [{ query: QUERY }],
      awaitRefetchQueries: true,
    }
  )

  const onDeleteClick = (id: DeleteMeasurementUnitMutationVariables['id']) => {
    if (
      confirm('Are you sure you want to delete measurementUnit ' + id + '?')
    ) {
      deleteMeasurementUnit({ variables: { id } })
    }
  }

  const CREATE_MEASUREMENT_UNIT_MUTATION: TypedDocumentNode<any, any> = gql`
    mutation CreateMeasurementUnit($input: CreateMeasurementUnitInput!) {
      createMeasurementUnit(input: $input) {
        id
      }
    }
  `

  const [createMeasurementUnit] = useMutation(
    CREATE_MEASUREMENT_UNIT_MUTATION,
    {
      onCompleted: () => {},
      onError: (error) => {
        toast.error(error.message)
      },
      refetchQueries: [{ query: QUERY }],
      awaitRefetchQueries: true,
    }
  )

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length < 2) {
        toast.error('CSV contains no data')
        return
      }
      const headers = rows[0].map((h) => String(h).trim())
      let imported = 0
      let failed = 0
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        const obj: Record<string, any> = {}
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = row[j] ?? ''
        }
        // Build input using expected create fields
        const input: Record<string, any> = {
          fullName:
            obj.fullName ??
            obj['Full name'] ??
            obj['fullName'] ??
            obj['fullName'],
          pluralName:
            obj.pluralName ??
            obj['Plural name'] ??
            obj['pluralName'] ??
            obj['pluralName'],
          shortName: obj.shortName ?? obj['Short name'] ?? undefined,
          symbol: obj.symbol ?? undefined,
          notation: obj.notation ?? undefined,
          description: obj.description ?? undefined,
        }
        // minimal validation
        if (!input.fullName || !input.pluralName) {
          failed++
          continue
        }
        try {
          // eslint-disable-next-line no-await-in-loop
          await createMeasurementUnit({ variables: { input } })
          imported++
        } catch (err) {
          failed++
        }
      }
      toast.success(`Imported ${imported} rows (${failed} failed)`)
      // reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      toast.error(err?.message || 'Import failed')
    }
  }

  const deleteAll = async () => {
    if (!confirm('Delete ALL measurement units? This cannot be undone.')) return
    let deleted = 0
    for (const mu of measurementUnits) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await deleteMeasurementUnit({ variables: { id: mu.id } })
        deleted++
      } catch (err) {
        // ignore individual failures
      }
    }
    toast.success(`Deleted ${deleted} measurement units`)
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr className="text-left">
            {/* <th>Id</th> */}
            <th>Full name</th>
            <th>Plural name</th>
            {/* <th>Short name</th>
            <th>Symbol</th>
            <th>Notation</th>
            <th>Dimension</th>
            <th>Description</th>
            <th>Conversion factor</th>
            <th>Base unit</th>
            <th>Created at</th>
            <th>Updated at</th> */}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {measurementUnits.map((measurementUnit) => (
            <tr key={measurementUnit.id}>
              {/* <td>{truncate(measurementUnit.id)}</td> */}
              <td>{truncate(measurementUnit.fullName)}</td>
              <td>{truncate(measurementUnit.pluralName)}</td>
              {/* <td>{truncate(measurementUnit.shortName)}</td>
              <td>{truncate(measurementUnit.symbol)}</td>
              <td>{truncate(measurementUnit.notation)}</td>
              <td>{formatEnum(measurementUnit.dimension)}</td>
              <td>{truncate(measurementUnit.description)}</td>
              <td>{truncate(measurementUnit.conversionFactor)}</td>
              <td>{truncate(measurementUnit.baseUnit)}</td>
              <td>{timeTag(measurementUnit.createdAt)}</td>
              <td>{timeTag(measurementUnit.updatedAt)}</td> */}
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.measurementUnit({ id: measurementUnit.id })}
                    title={
                      'Show measurementUnit ' + measurementUnit.id + ' detail'
                    }
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editMeasurementUnit({ id: measurementUnit.id })}
                    title={'Edit measurementUnit ' + measurementUnit.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete measurementUnit ' + measurementUnit.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(measurementUnit.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="mb-6" />
      <div className="flex space-x-4">
        <ExportButton
          label="Export All Units"
          data={measurementUnits}
          filename={`${todayAsYYYYMMDD()}-measurement-units.csv`}
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
          Import Units
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="print:hidden">
              Delete All Units
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all units. Make sure to export a copy first.
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

export default MeasurementUnitsList
