import EntityCell from 'src/components/Entity/EntityCell'

type EntityPageProps = {
  id: number
}

const EntityPage = ({ id }: EntityPageProps) => {
  return <EntityCell id={id} />
}

export default EntityPage
