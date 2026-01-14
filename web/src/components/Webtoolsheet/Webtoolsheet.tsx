import { useState } from 'react'

import CarpetRollLengthFromYardage from 'src/components/Tools/CarpetRollLengthFromYardage/CarpetRollLengthFromYardage'
import CharacterCount from 'src/components/Tools/CharacterCount/CharacterCount'
import ImperialCalculator from 'src/components/Tools/ImperialCalculator/ImperialCalculator'
import IsItADrop from 'src/components/Tools/IsItADrop/IsItADrop'
import PaintCalculator from 'src/components/Tools/PaintCalculator/PaintCalculator'
import PlankIncrementor from 'src/components/Tools/PlankIncrementor/PlankIncrementor'
import StepRollCalc from 'src/components/Tools/StepRollCalc/StepRollCalc'
import TheCutList from 'src/components/Tools/TheCutList/TheCutList'
import { Button } from 'src/components/ui/button'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from 'src/components/ui/card'
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
  { name: 'Carpet Roll Length', component: CarpetRollLengthFromYardage },
  { name: 'Imperial Calculator', component: ImperialCalculator },
  { name: 'Is It A Drop?', component: IsItADrop },
  { name: 'Paint Calculator', component: PaintCalculator },
  // { name: 'Character Count', component: CharacterCount },
]

const Webtoolsheet = ({ open = true, onOpenChange }) => {
  const [selectedToolIdx, setSelectedToolIdx] = useState('0')

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
                <tool.component />
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
