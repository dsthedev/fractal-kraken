import { useState } from 'react'

import {
  Menu,
  Home,
  LayoutDashboard,
  FileText,
  BadgeDollarSign,
  Building2,
  Wrench,
  LogIn,
  LogOut,
  Compass,
} from 'lucide-react'

import { navigate, routes } from '@cedarjs/router'

import { useAuth } from 'src/auth'
import { Button } from 'src/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/components/ui/sheet'
import Webtoolsheet from 'src/components/Webtoolsheet/Webtoolsheet'

type MenuItem = {
  label: string
  route: () => string
  icon: React.ReactNode
}

const Nav = () => {
  const { isAuthenticated, currentUser, logOut } = useAuth()

  const menuItems: MenuItem[] = [
    {
      label: 'Home',
      route: routes.home,
      icon: <Home className="mr-2 h-6 w-6" />,
    },
    // { label: 'Contact', route: routes.contact, icon: <Mail className="mr-2 h-6 w-6" /> },
  ]

  const [webToolsOpen, setWebToolsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const adminMenuItems: MenuItem[] = [
    // { label: 'Services', route: routes.services, icon: <Package className="mr-2 h-6 w-6" /> },
    {
      label: 'Dashboard',
      route: routes.dashboard,
      icon: <LayoutDashboard className="mr-2 h-6 w-6" />,
    },
    {
      label: 'Getting Started',
      route: routes.gettingStarted,
      icon: <Compass className="mr-2 h-6 w-6" />,
    },
    {
      label: 'Estimates',
      route: routes.estimates,
      icon: <FileText className="mr-2 h-6 w-6" />,
    },
    {
      label: 'Sevice Rates',
      route: routes.rates,
      icon: <BadgeDollarSign className="mr-2 h-6 w-6" />,
    },
    {
      label: 'Entities',
      route: routes.entities,
      icon: <Building2 className="mr-2 h-6 w-6" />,
    },
    {
      label: 'Web Tools',
      route: null,
      icon: <Wrench className="mr-2 h-6 w-6" />,
    },
  ]

  return (
    <>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 mt-4">
            {!isAuthenticated ? (
              <>
                {menuItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="justify-start text-xl"
                    onClick={() => {
                      navigate(item.route())
                      setMenuOpen(false)
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="justify-start text-xl"
                  onClick={() => {
                    window.location.href = '/login'
                    setMenuOpen(false)
                  }}
                >
                  <LogIn className="mr-2 h-6 w-6" />
                  Login
                </Button>
              </>
            ) : (
              <>
                {adminMenuItems.map((item) =>
                  item.label === 'Web Tools' ? (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="justify-start text-xl"
                      onClick={() => {
                        setMenuOpen(false)
                        setWebToolsOpen(true)
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Button>
                  ) : (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="justify-start text-xl"
                      onClick={() => {
                        navigate(item.route())
                        setMenuOpen(false)
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Button>
                  )
                )}
                <Button
                  variant="ghost"
                  className="justify-start text-xl"
                  onClick={() => {
                    logOut()
                    setMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-6 w-6" />
                  Logout
                </Button>
              </>
            )}
            {currentUser && (
              <div className="block my-4 p-4">
                <small className="text-muted-foreground">Logged in as:</small>
                <br />
                {currentUser?.email}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <Webtoolsheet open={webToolsOpen} onOpenChange={setWebToolsOpen} />
    </>
  )
}

export default Nav
