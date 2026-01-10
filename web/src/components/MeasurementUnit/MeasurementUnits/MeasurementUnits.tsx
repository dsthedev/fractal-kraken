import type {
  DeleteMeasurementUnitMutation,
  DeleteMeasurementUnitMutationVariables,
  FindMeasurementUnits,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/MeasurementUnit/MeasurementUnitsCell'
import { formatEnum, timeTag, truncate } from 'src/lib/formatters.js'

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

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
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
    </div>
  )
}

export default MeasurementUnitsList
