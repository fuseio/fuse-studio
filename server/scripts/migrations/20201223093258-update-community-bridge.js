module.exports = {
  async up (db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    await db.collection('communities').updateMany({ isMultiBridge: true }, { $set: { bridgeType: 'multi-amb-erc20-to-erc677', bridgeDirection: 'foreign-to-home' } })
  },

  async down (db, client) {
  }
}
