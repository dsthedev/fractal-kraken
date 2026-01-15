import { useState, useEffect } from 'react'

import CarpetRollLengthFromYardage from 'src/components/Tools/CarpetRollLengthFromYardage/CarpetRollLengthFromYardage'
import ImperialCalculator from 'src/components/Tools/ImperialCalculator/ImperialCalculator'
import IsItADrop from 'src/components/Tools/IsItADrop/IsItADrop'
import PaintCalculator from 'src/components/Tools/PaintCalculator/PaintCalculator'
import PlankIncrementor from 'src/components/Tools/PlankIncrementor/PlankIncrementor'
import PythagoreanTripleScale from 'src/components/Tools/PythagoreanTripleScale/PythagoreanTripleScale'
import StepRollCalc from 'src/components/Tools/StepRollCalc/StepRollCalc'
import TheCutList from 'src/components/Tools/TheCutList/TheCutList'
import { Card, CardContent, CardFooter } from 'src/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from 'src/components/ui/sheet'

const toolList = [
  { name: 'The Cut List', component: TheCutList },
  { name: 'Step Roll Calc', component: StepRollCalc },
  { name: 'Plank Incrementor', component: PlankIncrementor },
  { name: 'Pythagorean Triple Scale', component: PythagoreanTripleScale },
  { name: 'Carpet Roll Length', component: CarpetRollLengthFromYardage },
  { name: 'Imperial Calculator', component: ImperialCalculator },
  { name: 'Is It A Drop?', component: IsItADrop },
  { name: 'Paint Calculator', component: PaintCalculator },
  // { name: 'Character Count', component: CharacterCount },
]

const STORAGE_KEYS = ['last_used_webtool_idx', 'webtoolsheet_selectedToolIdx']

const Webtoolsheet = ({ open = true, onOpenChange }) => {
  const [selectedToolIdx, setSelectedToolIdx] = useState(() => {
    try {
      let stored: string | null = null
      for (const k of STORAGE_KEYS) {
        const v = localStorage.getItem(k)
        if (v !== null) {
          stored = v
          break
        }
      }
      if (stored !== null) {
        const n = Number(stored)
        if (!Number.isNaN(n) && n >= 0 && n < toolList.length) {
          return String(n)
        }
      }
    } catch {
      /* ignore (e.g., SSR) */
    }
    return '0'
  })

  useEffect(() => {
    try {
      // persist to all known keys for compatibility
      for (const k of STORAGE_KEYS) {
        localStorage.setItem(k, String(selectedToolIdx))
      }
    } catch {
      /* ignore */
    }
  }, [selectedToolIdx])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90vw] sm:max-w-2xl overflow-y-auto max-h-[100vh] p-2">
        <SheetHeader>
          <SheetTitle>Web Tools</SheetTitle>
        </SheetHeader>
        <div className="mb-1">
          <Select value={selectedToolIdx} onValueChange={setSelectedToolIdx}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {toolList.map((tool, idx) => (
                <SelectItem key={tool.name} value={String(idx)}>
                  {tool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          {toolList.map((tool, idx) => (
            <Card
              key={tool.name}
              className={
                idx === Number(selectedToolIdx) ? 'block mb-6' : 'hidden'
              }
            >
              {/* <CardHeader className="font-bold text-lg">{tool.name}</CardHeader> */}
              <CardContent>
                <tool.component
                  measurementsJson={undefined}
                  onTotalChange={undefined}
                />
              </CardContent>
              <CardFooter />
            </Card>
          ))}
        </div>
        <SheetFooter className="mt-8">
          <SheetClose className="w-auto text-xl py-2 px-10 rounded bg-zinc-800 text-white text-primary-foreground hover:bg-zinc-800/80 hover:text-white/80">
            Close
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default Webtoolsheet
