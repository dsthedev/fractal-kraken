import ActionCell from 'src/components/Action/ActionCell'

type ActionPageProps = {
  id: number
}

const ActionPage = ({ id }: ActionPageProps) => {
  return <ActionCell id={id} />
}

export default ActionPage
