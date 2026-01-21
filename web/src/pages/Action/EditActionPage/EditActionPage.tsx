import EditActionCell from 'src/components/Action/EditActionCell'

type ActionPageProps = {
  id: number
}

const EditActionPage = ({ id }: ActionPageProps) => {
  return <EditActionCell id={id} />
}

export default EditActionPage
