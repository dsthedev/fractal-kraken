import type {
  DeleteMeasurementUnitMutation,
  DeleteMeasurementUnitMutationVariables,
  FindMeasurementUnitById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

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

interface Props {
  measurementUnit: NonNullable<FindMeasurementUnitById['measurementUnit']>
}

const MeasurementUnit = ({ measurementUnit }: Props) => {
  const [deleteMeasurementUnit] = useMutation(
    DELETE_MEASUREMENT_UNIT_MUTATION,
    {
      onCompleted: () => {
        toast.success('MeasurementUnit deleted')
        navigate(routes.measurementUnits())
      },
      onError: (error) => {
        toast.error(error.message)
      },
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
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Measurement Unit: {measurementUnit.fullName} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Full name</th>
              <td>{measurementUnit.fullName}</td>
            </tr>
            <tr>
              <th>Plural name</th>
              <td>{measurementUnit.pluralName}</td>
            </tr>
            <tr>
              <th>Short name</th>
              <td>{measurementUnit.shortName}</td>
            </tr>
            <tr>
              <th>Symbol</th>
              <td>{measurementUnit.symbol}</td>
            </tr>
            <tr>
              <th>Notation</th>
              <td>{measurementUnit.notation}</td>
            </tr>
            {/* <tr>
              <th>Dimension</th>
              <td>{formatEnum(measurementUnit.dimension)}</td>
            </tr> */}
            <tr>
              <th>Description</th>
              <td>{measurementUnit.description}</td>
            </tr>
            {/* <tr>
              <th>Conversion factor</th>
              <td>{measurementUnit.conversionFactor}</td>
            </tr>
            <tr>
              <th>Base unit</th>
              <td>{measurementUnit.baseUnit}</td>
            </tr> */}
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editMeasurementUnit({ id: measurementUnit.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(measurementUnit.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default MeasurementUnit
