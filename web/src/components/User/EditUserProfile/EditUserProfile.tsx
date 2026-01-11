import type { EditUserById, UpdateUserMutationVariables } from 'types/graphql'

import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'

import { useAuth } from 'src/auth'

import UserForm from '../UserForm'

const UPDATE_USER_MUTATION: TypedDocumentNode<
  EditUserById,
  UpdateUserMutationVariables
> = gql`
  mutation UpdateUserMutation($id: String!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      name
      hashedPassword
      salt
      resetToken
      resetTokenExpiresAt
      roles
      createdAt
      updatedAt
    }
  }
`

interface EditUserProfileProps {
  onDone: () => void
}

const EditUserProfile = ({ onDone }: EditUserProfileProps) => {
  const { currentUser, reauthenticate } = useAuth()
  const [updateUser, { loading, error }] = useMutation(UPDATE_USER_MUTATION)

  const handleSave = async (
    data: { email: string; name?: string },
    id?: string
  ) => {
    if (!id || !currentUser) return

    try {
      await updateUser({
        variables: {
          id,
          input: {
            email: data.email,
            name: data.name,
          },
        },
      })

      // Refetch user data
      await reauthenticate()

      // Switch back to view mode
      onDone()
    } catch (err) {
      console.error('Failed to update user:', err)
    }
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm max-w-md">
      <h2 className="mb-6 text-2xl font-semibold">Edit Profile</h2>
      <UserForm
        user={currentUser}
        onSave={handleSave}
        error={error}
        loading={loading}
      />
      <button
        onClick={onDone}
        className="mt-4 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        Cancel
      </button>
    </div>
  )
}

export default EditUserProfile
