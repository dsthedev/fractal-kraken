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
      </div>

      <div className="space-y-6">
        {/* Default Entity Selector */}
        <EntitySelector
          label="My Contact Entity"
          description="Which contact entity represents you or your business. This entity will be used as the default for installer on estimates and invoices."
          fieldName="defaultEntityId"
        />

        {/* Default Retailer Entity Selector */}
        <EntitySelector
          label="Default Retailer"
          description="Select which contact entity you typically purchase materials from. This entity will be used as the default retailer on estimates and invoices."
          fieldName="defaultRetailerEntityId"
        />
      </div>
      <hr className="my-4" />
      <p className="text-sm mb-4 max-w-lg text-muted-foreground">
        If the contact entity you are looking for is not listed, you can add a
        new one here. After adding it, you can assign it from either of the
        selectors above.
      </p>
      <Dialog
        open={isNewEntityDialogOpen}
        onOpenChange={setIsNewEntityDialogOpen}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Contact / Entity
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Entity</DialogTitle>
            <hr className="my-4" />
          </DialogHeader>
          <NewEntityDialog onClose={() => setIsNewEntityDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ConnectedEntities
