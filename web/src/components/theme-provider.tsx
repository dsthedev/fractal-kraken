import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

type Theme = 'light' | 'dark'
type ThemeContextValue = {
  /** Actual applied theme (light/dark) for UI and icons */
  resolvedTheme: Theme
  /** User choice setter (binary) */
  setTheme: (theme: Theme) => void
}

type ThemeProviderProps = {
  children: React.ReactNode
  storageKey?: string
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({
  children,
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  // 1. Track explicit user choice ('light'/'dark') or undefined if not set
  const [userTheme, setUserTheme] = useState<Theme | undefined>(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null
    return stored ?? undefined
  })

  // 2. Track system preference
  const [systemTheme, setSystemTheme] = useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  // 3. Listen for OS theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) =>
      setSystemTheme(e.matches ? 'dark' : 'light')
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // 4. Compute the theme to actually apply (binary UX: user overrides system)
  const resolvedTheme: Theme = userTheme ?? systemTheme

  // 5. Apply resolved theme to document root
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  // 6. Setter that persists user choice
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setUserTheme(newTheme)
      localStorage.setItem(storageKey, newTheme)
    },
    [storageKey]
  )

  return (
    <ThemeContext.Provider value={{ resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
