module.exports = {
  async up (db, client) {
    await db.collection('userwallets').updateMany({ isContractDeployed: { $exists: false } }, { $set: { isContractDeployed: true } })
  },

  async down (db, client) {
  }
}
