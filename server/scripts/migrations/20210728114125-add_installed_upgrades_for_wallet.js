module.exports = {
  async up (db, client) {
    await db.collection('userwallets').updateMany({ upgradesInstalled: { $exists: false } }, { $set: { upgradesInstalled: [] } })
  },
  async down (db, client) {
  }
}
