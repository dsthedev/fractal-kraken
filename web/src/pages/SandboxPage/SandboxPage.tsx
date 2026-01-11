import ConvertRatesToDecimal from 'src/components/ConvertRatesToDecimal/ConvertRatesToDecimal'
import OldDataConverter from 'src/components/OldDataConverter/OldDataConverter'

const SandboxPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sandbox - Be Careful</h1>
      <p>
        {
          "If nothing is here, it's because experimental features are no longer needed or have been disabled."
        }
      </p>
      <hr className="my-4" />
      {/* <ConvertRatesToDecimal /> */}
      {/* <OldDataConverter /> */}
    </div>
  )
}

export default SandboxPage
