import { useState } from 'react'

import type {
  CreateTagMutation,
  CreateTagInput,
  CreateTagMutationVariables,
} from 'types/graphql'

import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'

const CREATE_TAG_MUTATION: TypedDocumentNode<
  CreateTagMutation,
  CreateTagMutationVariables
> = gql`
  mutation CreateTagMutation($input: CreateTagInput!) {
    createTag(input: $input) {
      id
      name
    }
  }
`

const QuickAddTag = ({ onAdded }: { onAdded?: () => void }) => {
  const [name, setName] = useState('')

  const [createTag, { loading, error }] = useMutation(CREATE_TAG_MUTATION, {
    onCompleted: () => {
      toast.success('Tag created')
      setName('')
      onAdded?.()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Please enter a tag name')
      return
    }
    const input: CreateTagInput = { name: trimmed }
    createTag({ variables: { input } })
  }

  return (
    <div className="inline-flex items-center gap-2">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Quickly add a tag"
          aria-label="New tag name"
          disabled={loading}
          className="min-w-[160px]"
        />
        <Button type="submit" variant="lime" size="sm" disabled={loading}>
          {loading ? 'Adding…' : 'Add'}
        </Button>
      </form>
      {error && <p className="rw-field-error">{error.message}</p>}
    </div>
  )
}

export default QuickAddTag
