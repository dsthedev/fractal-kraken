import OldDataConverter from 'src/components/OldDataConverter/OldDataConverter'
import SendExampleEmail from 'src/components/SendExampleEmail/SendExampleEmail'

const SandboxPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sandbox — Data Conversion</h1>
      <OldDataConverter />

      <SendExampleEmail />
    </div>
  )
}

export default SandboxPage
