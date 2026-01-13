import { useState } from 'react'

import { Wrench } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'

import { ModeCycle } from 'src/components/mode-cycle'
import { Button } from 'src/components/ui/button'
import Webtoolsheet from 'src/components/Webtoolsheet/Webtoolsheet'
import Footer from 'src/layouts/footer'
import Nav from 'src/layouts/nav'

type WrapperLayoutProps = {
  children?: React.ReactNode
}

const WrapperLayout = ({ children }: WrapperLayoutProps) => {
  const [webToolsOpen, setWebToolsOpen] = useState(false)

  return (
    <div id="wrapper">
      <header className="sticky top-0 z-50 bg-background/40 backdrop-blur p-2 border-b border-slate-400 dark:border-slate-800 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.4)] print:hidden">
        <div className="flex items-center max-w-[1080px] mx-auto">
          <div className="flex-none">
            <Nav />
          </div>
          <span className="flex-1 ml-4 text-muted-foreground">
            <Button asChild size="sm" variant="ghost">
              <Link to={routes.home()}>Home</Link>
            </Button>
          </span>
          <div className="flex-shrink pr-2">
            <div className="flex flex-row gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWebToolsOpen(true)}
                aria-label="Open Web Tools"
                className="relative"
              >
                <Wrench />
                <span className="sr-only">Open Tool Sheet</span>
              </Button>
              <ModeCycle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full px-1 sm:px-4 md:px-6 lg:px-8 max-w-[1080px]">
        <div className="rounded-lg border border-border bg-background p-4 my-6">
          {children}
        </div>
      </main>

      <Footer />
      <Webtoolsheet open={webToolsOpen} onOpenChange={setWebToolsOpen} />
    </div>
  )
}

export default WrapperLayout
