import React from 'react'

import { Button } from 'src/components/ui/button'
import { generateCSV } from 'src/lib/csvExport'

interface ExportButtonProps extends React.ComponentProps<typeof Button> {
  data: any[]
  filename: string
  label?: string
}

export const ExportButton = ({
  data,
  filename,
  label = 'Export',
  ...props
}: ExportButtonProps) => {
  const handleExport = () => {
    generateCSV(data, filename)
  }

  return (
    <Button
      className="print:hidden"
      variant="outline"
      size="sm"
      onClick={handleExport}
      {...props}
    >
      {label}
    </Button>
  )
}
