import { Menu } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'

import { useAuth } from 'src/auth'
import { Button } from 'src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from 'src/components/ui/dropdown-menu'

const Nav = () => {
  const { isAuthenticated, currentUser, logOut } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={() => (window.location.href = '/')}>
          Home
        </DropdownMenuItem>
        {!isAuthenticated ? (
          <>
            <DropdownMenuItem
              onSelect={() => (window.location.href = '/login')}
            >
              Login
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => (window.location.href = '/signup')}
            >
              Signup
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
