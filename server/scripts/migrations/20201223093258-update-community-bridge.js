module.exports = {
  async up (db, client) {
    // await db.collection('communities').updateMany({ isMultiBridge: true }, { $set: { bridgeType: 'multi-amb-erc20-to-erc677', bridgeDirection: 'foreign-to-home' } })
    const res = await db.collection('communities').updateMany({ foreignTokenAddress: { $exists: true, $ne: null } }, { $set: { bridgeDirection: 'home-to-foreign' } }, { upsert: true })
    console.log({ ...res })
  },
  async down (db, client) {
  }
}
