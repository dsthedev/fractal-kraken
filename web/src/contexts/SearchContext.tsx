import { createContext, useContext, useState, ReactNode } from 'react'

// ============================================================================
// SEARCH CONTEXT TYPE
// ============================================================================
// Defines what the context provides to consuming components

type SearchContextType = {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

// ============================================================================
// CREATE CONTEXT
// ============================================================================
// Create the context with an undefined default (will be provided by SearchProvider)

const SearchContext = createContext<SearchContextType | undefined>(undefined)

// ============================================================================
// SEARCH PROVIDER COMPONENT
// ============================================================================
// Wraps children and provides search state to all descendants via context

type SearchProviderProps = {
  children: ReactNode
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  // State for the search query
  const [searchQuery, setSearchQuery] = useState('')

  const value = {
    searchQuery,
    setSearchQuery,
  }

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}

// ============================================================================
// USESEACH HOOK
// ============================================================================
// Custom hook for consuming components to access the search context
// Throws error if used outside of SearchProvider

export const useSearch = () => {
  const context = useContext(SearchContext)

  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }

  return context
}
