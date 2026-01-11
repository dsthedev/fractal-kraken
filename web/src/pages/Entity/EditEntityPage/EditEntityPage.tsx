import EditEntityCell from 'src/components/Entity/EditEntityCell'

type EntityPageProps = {
  id: number
}

const EditEntityPage = ({ id }: EntityPageProps) => {
  return <EditEntityCell id={id} />
}

export default EditEntityPage
