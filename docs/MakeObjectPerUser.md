
# Make Object Per-User (example: Tag)

Goal
----

Make objects (example: `Tag`) owned by a user so that:
- The object's `authorId` is always the creating user's id.
- Reads, updates and deletes are limited to objects owned by the current user.
- The `authorId` is not editable from the UI.

High-level principle
--------------------

Enforce ownership in the service layer (server) — the client (form) should hide/omit `authorId`, but authorization must be enforced server-side. Relying only on the form is insecure because clients can be tampered with.

Step-by-step (Tag example)
--------------------------

1) Service: set `authorId` on create and ignore any incoming `authorId`

 	 - File: `api/src/services/tags/tags.ts`
 	 - Replace the current `createTag` implementation with code that reads the current user from `context`, rejects unauthenticated requests, and creates the Tag using `authorId` from `context` only.

 	 Example:

 	 ```ts
 	 import { context } from '@cedarjs/graphql-server'

 	 export const createTag: MutationResolvers['createTag'] = ({ input }) => {
 	 	 const userId = context.currentUser?.id
 	 	 if (!userId) {
 	 	 	 throw new Error('User not authenticated')
 	 	 }

 	 	 // Explicitly pick allowed fields from input (do not trust incoming authorId)
 	 	 const { name, description } = input as any

 	 	 return db.tag.create({
 	 	 	 data: {
 	 	 	 	 name,
 	 	 	 	 description,
 	 	 	 	 authorId: userId,
 	 	 	 },
 	 	 })
 	 }
 	 ```

 	 Notes:
 	 - Do not spread `input` blindly into `data` if it may contain `authorId` or other fields you don't control.

2) GraphQL SDL / Input types: (do this after createTag update)

 	 - Remove `authorId` from the `CreateTagInput`/`UpdateTagInput` in the SDL so clients are not required to send it. This should be done immediately after the service starts setting `authorId` on create to avoid validation errors.
 	 - Regenerate types after the change so the web and api TS types stay in sync.

 	 Example:

 	 ```diff
 	 input CreateTagInput {
 	 	 name: String!
 	 	 description: String
 	- authorId: String!
 	 }

 	 input UpdateTagInput {
 	 	 name: String
 	 	 description: String
 	- authorId: String
 	 }
 	 ```

 	 - Keep `@requireAuth` on `createTag`, `updateTag`, `deleteTag` to ensure only authenticated users can call them.

3) Frontend: remove `authorId` from the form & never allow editing it

 	 - File: `web/src/components/Tag/TagForm/TagForm.tsx`
 	 - Remove the `Label`/`TextField` block for `authorId` so users cannot edit it. Test creating a Tag after the SDL/type change to confirm the server provides `authorId`.

 	 Minimal change example (remove this block from the form):

 	 ```tsx
 	 <Label name="authorId" className="rw-label" errorClassName="rw-label rw-label-error">
 	 	 Author id
 	 </Label>

 	 <TextField
 	 	 name="authorId"
 	 	 defaultValue={props.tag?.authorId}
 	 	 className="rw-input"
 	 	 errorClassName="rw-input rw-input-error"
 	 	 validation={{ required: true }}
 	 />

 	 <FieldError name="authorId" className="rw-field-error" />
 	 ```

 	 - Optional: if you want to show the owner on the edit view (read-only), render it as plain text rather than as a form input.

4) Service: restrict list and single-item queries to the current user

 	 - For list queries (all tags for current user): filter by `authorId`.

 	 Example:

 	 ```ts
 	 export const tags: QueryResolvers['tags'] = () => {
 	 	 return db.tag.findMany({
 	 	 	 where: { authorId: context.currentUser?.id },
 	 	 })
 	 }
 	 ```

 	 - For a single tag, use `findFirst` with both `id` and `authorId` to ensure ownership.

 	 ```ts
 	 export const tag: QueryResolvers['tag'] = ({ id }) => {
 	 	 return db.tag.findFirst({
 	 	 	 where: { id, authorId: context.currentUser?.id },
 	 	 })
 	 }
 	 ```

5) Service: protect updates and deletes by ownership and strip any authorId from incoming data

 	 - Before updating or deleting, verify the item belongs to the current user. Then perform the operation.

 	 Example `updateTag`:

 	 ```ts
 	 export const updateTag: MutationResolvers['updateTag'] = async ({ id, input }) => {
 	 	 const userId = context.currentUser?.id
 	 	 if (!userId) throw new Error('User not authenticated')

 	 	 const existing = await db.tag.findFirst({ where: { id, authorId: userId } })
 	 	 if (!existing) throw new Error('Tag not found or not owned by current user')

 	 	 // Remove authorId if present in input so ownership cannot be changed
 	 	 const { authorId: _a, ...safeInput } = input as any

 	 	 return db.tag.update({ where: { id }, data: safeInput })
 	 }
 	 ```

 	 - Do the same pattern for `deleteTag`:

 	 ```ts
 	 export const deleteTag: MutationResolvers['deleteTag'] = async ({ id }) => {
 	 	 const userId = context.currentUser?.id
 	 	 if (!userId) throw new Error('User not authenticated')

 	 	 const existing = await db.tag.findFirst({ where: { id, authorId: userId } })
 	 	 if (!existing) throw new Error('Tag not found or not owned by current user')

 	 	 return db.tag.delete({ where: { id } })
 	 }
 	 ```

6) Admin / multi-user accounts (optional advanced)

 	 - If you need admins or superadmins to see all tags, add a role check in the service functions and skip `authorId` filtering when the current user has an admin role.

 	 Example:

 	 ```ts
 	 const isAdmin = context.currentUser?.roles?.includes('superadmin')
 	 const where = isAdmin ? {} : { authorId: context.currentUser?.id }
 	 const rows = await db.tag.findMany({ where })
 	 ```

7) Tests

 	 - Add service-level tests to assert:
 	 	 - Creating a Tag assigns `authorId` from `context.currentUser`.
 	 	 - Listing only returns tags for the current user (unless admin).
 	 	 - Updating/deleting fails if the tag is not owned by the current user.

Why handle this in the service (short answer)
-----------------------------------------

- The server is the single source of truth and cannot be bypassed by a malicious client.
- The form should be a convenience UI only; it can hide the field, but the service must enforce ownership.
- Handling in the service keeps client code simple and avoids trusting incoming client fields for security-sensitive data.

Quick checklist to implement
---------------------------
- [ ] Update `createTag` to use `context.currentUser.id` and ignore incoming `authorId`.
- [ ] Update `tags` and `tag` queries to filter by `authorId`.
- [ ] Update `updateTag` and `deleteTag` to verify ownership before changing/deleting.
- [ ] Remove `authorId` field from `web/src/components/Tag/TagForm/TagForm.tsx`.
- [ ] Add SDL `@requireAuth` (if not already present) to create/update/delete.
- [ ] Add tests validating ownership enforcement.

If you'd like, I can:
- Apply the exact code edits to `api/src/services/tags/tags.ts` (safe, minimal changes) now.
- Remove the `authorId` input from `TagForm.tsx` and adjust the UI to show a read-only owner if desired.

Tell me which edits you want automated and I will make them.
