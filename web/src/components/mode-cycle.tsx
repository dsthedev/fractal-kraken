import { Moon, Sun, Monitor } from 'lucide-react'

import { useTheme } from 'src/components/theme-provider'
import { Button } from 'src/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'src/components/ui/tooltip'

const themes = ['light', 'dark', 'system'] as const

function getNextTheme(theme: (typeof themes)[number]) {
  const index = themes.indexOf(theme)
  return themes[(index + 1) % themes.length]
}

export function ModeCycle() {
  const { theme = 'system', setTheme } = useTheme()
  const nextTheme = getNextTheme(theme)

  const cycleTheme = () => {
    setTheme(nextTheme)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={cycleTheme}
          aria-label="Toggle theme"
          className="relative"
        >
          {/* Light */}
          <Sun
            className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
              theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
            }`}
          />

          {/* Dark */}
          <Moon
            className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
              theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'
            }`}
          />

          {/* System */}
          <Monitor
            className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
              theme === 'system' ? 'scale-100 rotate-0' : 'scale-0'
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
