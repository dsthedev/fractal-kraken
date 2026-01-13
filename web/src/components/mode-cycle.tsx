import { Moon, Sun } from 'lucide-react'

import { useTheme } from 'src/components/theme-provider'
import { Button } from 'src/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'src/components/ui/tooltip'

export function ModeCycle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  // Toggle to the opposite of the current resolved theme
  const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light'

  const handleToggle = () => {
    // Persist the new user choice
    setTheme(nextTheme)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggle}
          aria-label="Toggle theme"
          className="relative"
        >
          {/* Light icon */}
          <Sun
            className={`absolute transition-all ${
              resolvedTheme === 'light'
                ? 'scale-100 rotate-0'
                : 'scale-0 -rotate-90'
            }`}
          />
          {/* Dark icon */}
          <Moon
            className={`absolute transition-all ${
              resolvedTheme === 'dark'
                ? 'scale-100 rotate-0'
                : 'scale-0 rotate-90'
            }`}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Switch to <strong>{nextTheme}</strong> mode
      </TooltipContent>
    </Tooltip>
  )
}
