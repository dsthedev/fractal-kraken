import { ModeCycle } from 'src/components/mode-cycle'

type WrapperLayoutProps = {
  children?: React.ReactNode
}

const WrapperLayout = ({ children }: WrapperLayoutProps) => {
  return (
    <div id="wrapper">
      {children}
      <ModeCycle />
    </div>
  )
}

export default WrapperLayout
