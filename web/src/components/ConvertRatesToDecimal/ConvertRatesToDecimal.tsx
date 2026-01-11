import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

const CONVERT_RATES_TO_DECIMAL_MUTATION = gql`
  mutation ConvertRatesToDecimal {
    convertRatesToDecimal {
      success
      message
      count
    }
  }
`

const ConvertRatesToDecimal = () => {
  const [convertRatesToDecimal, { loading }] = useMutation(
    CONVERT_RATES_TO_DECIMAL_MUTATION,
    {
      onCompleted: (data) => {
        toast.success(data.convertRatesToDecimal.message)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const handleConvert = () => {
    if (
      confirm(
        'This will convert all rates from cents to dollars. Are you sure?'
      )
    ) {
      convertRatesToDecimal()
    }
  }

  return (
    <div className="mb-8 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
      <h2 className="text-xl font-semibold mb-2">Convert Rates to Decimal</h2>
      <p className="text-sm mb-4">
        Convert existing rates from cents (integer) to dollars (decimal). This
        should only be run once after the database migration.
      </p>
      <button
        onClick={handleConvert}
        disabled={loading}
        className="rw-button rw-button-blue"
      >
        {loading ? 'Converting...' : 'Convert Rates to Decimal'}
      </button>
    </div>
  )
}

export default ConvertRatesToDecimal
