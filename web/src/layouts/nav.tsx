import { useState } from 'react'

import { Menu } from 'lucide-react'

import { navigate, routes } from '@cedarjs/router'

import { useAuth } from 'src/auth'
import { Button } from 'src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from 'src/components/ui/dropdown-menu'
import Webtoolsheet from 'src/components/Webtoolsheet/Webtoolsheet'

type MenuItem = {
  label: string
  route: () => string
}

const Nav = () => {
  const { isAuthenticated, currentUser, logOut } = useAuth()

  const menuItems: MenuItem[] = [
    { label: 'Home', route: routes.home },
    // { label: 'Contact', route: routes.contact },
  ]

  const [webToolsOpen, setWebToolsOpen] = useState(false)
  const adminMenuItems: MenuItem[] = [
    // { label: 'Services', route: routes.services },
    { label: 'Dashboard', route: routes.dashboard },
    { label: 'Estimates', route: routes.estimates },
    { label: 'Sevice Rates', route: routes.rates },
    { label: 'Entities', route: routes.entities },
    { label: 'Web Tools', route: null },
  ]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {!isAuthenticated ? (
            <>
              {menuItems.map((item) => (
                <DropdownMenuItem
                  className="text-lg"
                  key={item.label}
                  onSelect={() => {
                    navigate(item.route())
                  }}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="text-lg"
                onSelect={() => (window.location.href = '/login')}
              >
                Login
              </DropdownMenuItem>
            </>
          ) : (
            <>
              {adminMenuItems.map((item) =>
                item.label === 'Web Tools' ? (
                  <DropdownMenuItem
                    className="text-lg"
                    key={item.label}
                    onSelect={() => setWebToolsOpen(true)}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-lg"
                    key={item.label}
                    onSelect={() => {
                      navigate(item.route())
                    }}
                  >
                    {item.label}
                  </DropdownMenuItem>
                )
              )}
              <DropdownMenuItem className="text-lg" onSelect={logOut}>
                Logout ({currentUser?.email})
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Webtoolsheet open={webToolsOpen} onOpenChange={setWebToolsOpen} />
    </>
  )
}

export default Nav
