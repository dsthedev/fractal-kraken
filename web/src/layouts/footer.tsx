import { Wrench } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'

import { ModeCycle } from 'src/components/mode-cycle'
import { Button } from 'src/components/ui/button'
import AdminNav from 'src/layouts/admin-nav'
import { useWebTools } from 'src/layouts/WrapperLayout/WebToolsContext'

const Footer = () => {
  const { setIsOpen } = useWebTools()

  return (
    <footer id="footer" className="w-full text-center py-4">
      <ul className="flex flex-col justify-center gap-4">
        <li>
          <Link to={routes.home()}>&copy; {process.env.PROJECT_NAME}</Link>
        </li>
        <li className="flex justify-center gap-4 print:hidden">
          <AdminNav />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsOpen(true)}
            aria-label="Open Web Tools"
            className="relative"
          >
            <Wrench />
            <span className="sr-only">Open Tool Sheet</span>
          </Button>
          <ModeCycle />
        </li>
      </ul>
    </footer>
  )
}

export default Footer
