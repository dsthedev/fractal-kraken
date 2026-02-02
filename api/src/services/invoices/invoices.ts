import type {
  QueryResolvers,
  MutationResolvers,
  InvoiceRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const invoices: QueryResolvers['invoices'] = () => {
  return db.invoice.findMany()
}

export const invoice: QueryResolvers['invoice'] = ({ uuid }) => {
  return db.invoice.findUnique({
    where: { uuid },
  })
}

export const createInvoice: MutationResolvers['createInvoice'] = ({
  input,
}) => {
  return db.invoice.create({
    data: input,
  })
}

export const updateInvoice: MutationResolvers['updateInvoice'] = ({
  uuid,
  input,
}) => {
  return db.invoice.update({
    data: input,
    where: { uuid },
  })
}

export const deleteInvoice: MutationResolvers['deleteInvoice'] = ({ uuid }) => {
  return db.invoice.delete({
    where: { uuid },
  })
}

export const Invoice: InvoiceRelationResolvers = {
  author: (_obj, { root }) => {
    return db.invoice.findUnique({ where: { uuid: root?.uuid } }).author()
  },
  payorEntity: (_obj, { root }) => {
    return db.invoice.findUnique({ where: { uuid: root?.uuid } }).payorEntity()
  },
  payeeEntity: (_obj, { root }) => {
    return db.invoice.findUnique({ where: { uuid: root?.uuid } }).payeeEntity()
  },
  sourceEstimate: (_obj, { root }) => {
    return db.invoice
      .findUnique({ where: { uuid: root?.uuid } })
      .sourceEstimate()
  },
  sourceInstallerEntity: (_obj, { root }) => {
    return db.invoice
      .findUnique({ where: { uuid: root?.uuid } })
      .sourceInstallerEntity()
  },
  sourceClientEntity: (_obj, { root }) => {
    return db.invoice
      .findUnique({ where: { uuid: root?.uuid } })
      .sourceClientEntity()
  },
  sourceRetailerEntity: (_obj, { root }) => {
    return db.invoice
      .findUnique({ where: { uuid: root?.uuid } })
      .sourceRetailerEntity()
  },
  billableItems: (_obj, { root }) => {
    return db.invoice
      .findUnique({ where: { uuid: root?.uuid } })
      .billableItems()
  },
  entity: (_obj, { root }) => {
    return db.invoice.findUnique({ where: { uuid: root?.uuid } }).entity()
  },
}
