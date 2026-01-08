import { Link, routes } from '@cedarjs/router'

import { ModeCycle } from 'src/components/mode-cycle'

const Footer = () => {
  return (
    <footer id="footer" className="w-full text-center py-4">
      <ul className="flex flex-col justify-center gap-4">
        <li>
          <Link to={routes.home()}>&copy; {process.env.PROJECT_NAME}</Link>
        </li>
        <li>
          <ModeCycle />
        </li>
      </ul>
    </footer>
  )
}

export default Footer
