import type {
  QueryResolvers,
  MutationResolvers,
  InvoiceRelationResolvers,
} from 'types/graphql'

import { context, RedwoodGraphQLError } from '@cedarjs/graphql-server'

import { db } from 'src/lib/db'
import { createRefNo, getWeekNumber } from 'src/lib/estimateTitle'
import { sendInvoiceEmail } from 'src/services/mailer/mailer'

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

export const createInvoiceFromEstimate: MutationResolvers['createInvoiceFromEstimate'] =
  async ({ estimateId }) => {
    const currentUserId = context.currentUser?.id
    if (!currentUserId) {
      throw new RedwoodGraphQLError('User not authenticated')
    }

    const estimate = await db.estimate.findFirst({
      where: {
        id: estimateId,
        authorId: currentUserId,
      },
      include: {
        billableItems: true,
        installerEntity: true,
        clientEntity: true,
        retailerEntity: true,
      },
    })

    if (!estimate) {
      throw new RedwoodGraphQLError('Estimate not found')
    }

    if (!estimate.installerEntityId) {
      throw new RedwoodGraphQLError('Estimate is missing an installer entity')
    }

    const installer = estimate.installerEntity
    const client = estimate.clientEntity
    const retailer = estimate.retailerEntity
    const payorEntity = retailer ?? client

    if (!payorEntity) {
      throw new RedwoodGraphQLError(
        'Estimate is missing a payor entity (retailer or client)'
      )
    }

    const retailerName = retailer?.nickname || retailer?.name
    const clientName = client?.nickname || client?.name
    const invoiceNumber = createRefNo(retailerName, clientName)

    const dueAt = new Date()
    dueAt.setDate(dueAt.getDate() + 30)

    const billableItemCreates = estimate.billableItems.map((item) => ({
      actionId: item.actionId,
      materialId: item.materialId,
      unitId: item.unitId,
      unitPrice: item.unitPrice,
      pricingType: item.pricingType,
      quantity: item.quantity,
      subtotal: item.subtotal,
      estimatedMinutesPerUnit: item.estimatedMinutesPerUnit,
      notes: item.notes,
      sortOrder: item.sortOrder,
      authorId: currentUserId,
    }))

    const invoice = await db.invoice.create({
      data: {
        authorId: currentUserId,
        invoiceNumber,
        status: 'DRAFT',
        payStatus: 'UNPAID',
        dueAt,
        payorEntityId: payorEntity.id,
        payeeEntityId: estimate.installerEntityId,
        sourceEstimateId: estimate.id,
        sourceInstallerEntityId: estimate.installerEntityId,
        sourceClientEntityId: estimate.clientEntityId,
        sourceRetailerEntityId: estimate.retailerEntityId,
        payorAddressLine1: payorEntity.addressLine1,
        payorAddressLine2: payorEntity.addressLine2,
        payorCity: payorEntity.city,
        payorState: payorEntity.state,
        payorPostalCode: payorEntity.postalCode,
        payorCountry: payorEntity.country,
        payeeAddressLine1: installer.addressLine1,
        payeeAddressLine2: installer.addressLine2,
        payeeCity: installer.city,
        payeeState: installer.state,
        payeePostalCode: installer.postalCode,
        payeeCountry: installer.country,
        jobAddressLine1: estimate.jobAddressLine1,
        jobAddressLine2: estimate.jobAddressLine2,
        jobCity: estimate.jobCity,
        jobState: estimate.jobState,
        jobPostalCode: estimate.jobPostalCode,
        jobCountry: estimate.jobCountry,
        subtotal: estimate.subtotal,
        taxTotal: estimate.taxTotal,
        total: estimate.total,
        notes: estimate.notes,
        entityId: estimate.entityId,
        billableItems: billableItemCreates.length
          ? { create: billableItemCreates }
          : undefined,
      },
    })

    await db.estimate.update({
      where: { id: estimate.id },
      data: { status: 'INVOICED' },
    })

    return invoice
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

export const sendInvoice: MutationResolvers['sendInvoice'] = async ({
  uuid,
  recipientEmail,
}) => {
  await sendInvoiceEmail({ uuid, recipientEmail })

  const invoice = await db.invoice.findUnique({
    where: { uuid },
  })

  return invoice
}
