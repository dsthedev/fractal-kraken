import { KeySquare } from 'lucide-react'

import { navigate, routes } from '@cedarjs/router'

import { useAuth } from 'src/auth'
import { Button } from 'src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from 'src/components/ui/dropdown-menu'

const AdminNav = () => {
  const { isAuthenticated, currentUser } = useAuth()

  if (isAuthenticated && currentUser.roles.includes('admin')) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="print:hidden">
          <Button variant="outline">
            <KeySquare />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top">
          <DropdownMenuItem
            onSelect={() => {
              navigate(routes.users())
            }}
          >
            Users
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else {
    return false
  }
}

export default AdminNav
