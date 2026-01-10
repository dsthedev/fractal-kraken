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

type MenuItem = {
  label: string
  route: () => string
}

const Nav = () => {
  const { isAuthenticated, currentUser, logOut } = useAuth()

  const menuItems: MenuItem[] = [
    { label: 'Home', route: routes.home },
    // { label: 'Contact', route: routes.contact },
    // Add more admin items here as needed
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onSelect={() => {
              navigate(item.route())
            }}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
        {!isAuthenticated ? (
          <>
            <DropdownMenuItem
              onSelect={() => (window.location.href = '/login')}
            >
              Login
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onSelect={logOut}>
            Logout ({currentUser?.email})
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Nav
