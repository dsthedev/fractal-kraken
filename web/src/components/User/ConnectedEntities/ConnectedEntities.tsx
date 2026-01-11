import { useState } from 'react'

import { PlusCircle } from 'lucide-react'

import { Button } from 'src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'src/components/ui/dialog'

import EntitySelector from '../EntitySelector'
import NewEntityDialog from '../NewEntityDialog'

const ConnectedEntities = () => {
  const [isNewEntityDialogOpen, setIsNewEntityDialogOpen] = useState(false)

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Connected Entities</h2>
        <Dialog
          open={isNewEntityDialogOpen}
          onOpenChange={setIsNewEntityDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Entity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Entity</DialogTitle>
            </DialogHeader>
            <NewEntityDialog onClose={() => setIsNewEntityDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {/* Default Entity Selector */}
        <EntitySelector
          label="Default Entity"
          description="Select your default entity for new estimates and invoices"
          fieldName="defaultEntityId"
        />

        {/* Default Retailer Entity Selector */}
        <EntitySelector
          label="Default Retailer Entity"
          description="Select your default retailer entity for retail pricing"
          fieldName="defaultRetailerEntityId"
        />
      </div>
    </div>
  )
}

export default ConnectedEntities
