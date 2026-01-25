import { createContext, useContext, useState } from 'react'

type WebToolsContextType = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const WebToolsContext = createContext<WebToolsContextType | undefined>(undefined)

export const WebToolsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <WebToolsContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </WebToolsContext.Provider>
  )
}

export const useWebTools = () => {
  const context = useContext(WebToolsContext)
  if (!context) {
    throw new Error('useWebTools must be used within WebToolsProvider')
  }
  return context
}
