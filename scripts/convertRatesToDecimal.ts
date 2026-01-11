import { db } from 'api/src/lib/db'

async function main() {
  const rates = await db.rate.findMany()

  console.log(`Converting ${rates.length} rates from cents to dollars...`)

  for (const rate of rates) {
    const subAmount = (parseFloat(String(rate.subAmount)) / 100).toFixed(2)
    const retailAmount = (parseFloat(String(rate.retailAmount)) / 100).toFixed(
      2
    )

    await db.rate.update({
      where: { id: rate.id },
      data: {
        subAmount,
        retailAmount,
      },
    })
  }

  console.log('✅ Conversion complete')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
