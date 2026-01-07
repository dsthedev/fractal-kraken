type WrapperLayoutProps = {
  children?: React.ReactNode
}

const WrapperLayout = ({ children }: WrapperLayoutProps) => {
  return <div id="wrapper">{children}</div>
}

export default WrapperLayout
