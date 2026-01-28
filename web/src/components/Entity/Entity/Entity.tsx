import {
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  User,
} from 'lucide-react'
import type {
  DeleteEntityMutation,
  DeleteEntityMutationVariables,
  FindEntityById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'src/components/ui/alert-dialog'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
import { Separator } from 'src/components/ui/separator'
import { formatEnum } from 'src/lib/formatters.js'

const DELETE_ENTITY_MUTATION: TypedDocumentNode<
  DeleteEntityMutation,
  DeleteEntityMutationVariables
> = gql`
  mutation DeleteEntityMutation($id: Int!) {
    deleteEntity(id: $id) {
      id
    }
  }
`

interface Props {
  entity: NonNullable<FindEntityById['entity']>
}

const Entity = ({ entity }: Props) => {
  const [deleteEntity] = useMutation(DELETE_ENTITY_MUTATION, {
    onCompleted: () => {
      toast.success('Contact deleted')
      navigate(routes.entities())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteEntityMutationVariables['id']) => {
    deleteEntity({ variables: { id } })
  }

  const formatAddress = () => {
    const parts = [
      entity.addressLine1,
      entity.addressLine2,
      entity.city && entity.state
        ? `${entity.city}, ${entity.state}`
        : entity.city || entity.state,
      entity.postalCode,
      entity.country,
    ].filter(Boolean)

    return parts.length > 0 ? parts.join('\n') : null
  }

  const address = formatAddress()

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl font-bold">
                  {entity.nickname || entity.name}
                </CardTitle>
                <Badge variant="outline" className="text-sm">
                  {formatEnum(entity.type)}
                </Badge>
              </div>
              {entity.nickname && entity.name !== entity.nickname && (
                <CardDescription className="text-base">
                  {entity.name}
                </CardDescription>
              )}
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={routes.editEntity({ id: entity.id })}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the contact &ldquo;
                      {entity.nickname || entity.name}&rdquo;. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeleteClick(entity.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {entity.contactName && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-medium">{entity.contactName}</p>
              </div>
            </div>
          )}

          {entity.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a
                  href={`mailto:${entity.email}`}
                  className="font-medium text-primary hover:underline"
                >
                  {entity.email}
                </a>
              </div>
            </div>
          )}

          {entity.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a
                  href={`tel:${entity.phone}`}
                  className="font-medium text-primary hover:underline"
                >
                  {entity.phone}
                </a>
              </div>
            </div>
          )}

          {address && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium whitespace-pre-line">{address}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      {entity.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {entity.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Entity
