import { Link, routes } from '@cedarjs/router'
import { Toaster } from '@cedarjs/web/toast'

import { Input } from 'src/components/ui/input'
import { SearchProvider, useSearch } from 'src/contexts/SearchContext'

const SearchInput = () => {
  const { searchQuery, setSearchQuery } = useSearch()

  return (
    <Input
      type="text"
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="max-w-sm"
    />
  )
}

type LayoutProps = {
  title: string
  titleTo: keyof typeof routes
  buttonLabel: string
  buttonTo: keyof typeof routes
  children: React.ReactNode
  showSearch?: boolean // Optional prop to enable search functionality
}

const AdminScaffoldLayoutContent = ({
  title,
  titleTo,
  buttonLabel,
  buttonTo,
  showSearch = false,
  children,
}: LayoutProps) => {
  return (
    <div className="rw-scaffold">
      <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
      <header className="rw-header flex print:hidden flex-col sm:flex-row gap-2 sm:gap-4">
        <h1 className="rw-heading rw-heading-primary flex-1">
          <Link to={routes[titleTo]()} className="rw-link">
            {title}
          </Link>
        </h1>
        {/* Search input only renders if showSearch prop is true */}
        <div className="flex-auto w-full">{showSearch && <SearchInput />}</div>
        <Link
          to={routes[buttonTo]()}
          className="rw-button rw-button-green rw-button-small"
        >
          <div className="rw-button-icon">+</div> {buttonLabel}
        </Link>
      </header>
      <main className="rw-main">{children}</main>
    </div>
  )
}

// ============================================================================
// ADMIN SCAFFOLD LAYOUT (EXPORTED)
// ============================================================================
// Main component that wraps content in SearchProvider
// This ensures SearchContext is available to both the search input and children

const AdminScaffoldLayout = (props: LayoutProps) => {
  return (
    <SearchProvider>
      <AdminScaffoldLayoutContent {...props} />
    </SearchProvider>
  )
}

export default AdminScaffoldLayout
