import Footer from 'src/layouts/footer'
import Nav from 'src/layouts/nav'

type WrapperLayoutProps = {
  children?: React.ReactNode
}

const WrapperLayout = ({ children }: WrapperLayoutProps) => {
  return (
    <div id="wrapper">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur p-2">
        <div className="flex items-center justify-left max-w-[1080px] mx-auto">
          <Nav />
          <span className="text-sm ml-4 text-muted-foreground">
            {process.env.PROJECT_NAME}
          </span>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full px-1 sm:px-4 md:px-6 lg:px-8 max-w-[1080px]">
        <div className="rounded-lg border border-border bg-background p-4 my-6">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default WrapperLayout
