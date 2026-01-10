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

// ============================================================================
// ADMIN MENU CONFIGURATION TYPE
// ============================================================================

type AdminMenuItem = {
  label: string
  route: () => string
}

// ============================================================================
// ADMIN NAV COMPONENT
// ============================================================================

const AdminNav = () => {
  const { isAuthenticated, currentUser } = useAuth()

  // Define menu items inside component so routes are evaluated at render time
  const adminMenuItems: AdminMenuItem[] = [
    { label: 'Users', route: routes.users },
    { label: 'Units', route: routes.measurementUnits },
    // Add more admin items here as needed
  ]

  if (isAuthenticated && currentUser.roles.includes('admin')) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="print:hidden">
          <Button variant="outline">
            <KeySquare />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top">
          {adminMenuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              onSelect={() => {
                navigate(item.route())
              }}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else {
    return false
  }
}

export default AdminNav
