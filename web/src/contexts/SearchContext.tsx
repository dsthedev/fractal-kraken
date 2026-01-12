import { createContext, useContext, useState, ReactNode } from 'react'

type SearchContextType = {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

type SearchProviderProps = {
  children: ReactNode
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const value = {
    searchQuery,
    setSearchQuery,
  }

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}

export const useSearch = () => {
  const context = useContext(SearchContext)

  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }

  return context
}
