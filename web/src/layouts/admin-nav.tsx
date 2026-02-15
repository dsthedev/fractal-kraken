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

type AdminMenuItem = {
  label: string
  route: () => string
}

const AdminNav = () => {
  const { isAuthenticated, currentUser } = useAuth()

  const adminMenuItems: AdminMenuItem[] = [
    {
      label: 'Orphaned Billable Items Cleanup',
      route: routes.orphanedBillableItemsCleanup,
    },
    { label: 'Invoices', route: routes.invoices },
    { label: 'Estimates', route: routes.estimates },
    { label: 'Billable Items', route: routes.billableItems },
    { label: 'Rates', route: routes.rates },
    { label: 'Entities', route: routes.entities },
    // { label: 'Services', route: routes.services },
    { label: 'Materials', route: routes.materials },
    { label: 'Actions', route: routes.actions },
    { label: 'Units', route: routes.measurementUnits },
    { label: 'Users', route: routes.users },
    { label: 'Sandbox', route: routes.sandbox },
    { label: 'Old Rates', route: routes.viewOldRates },
    // Add more admin items here as needed
  ]

  if (isAuthenticated && currentUser.roles.includes('admin')) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
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
