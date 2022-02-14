module.exports = {
  async up (db, client) {
    await db.collection('userwallets').updateMany({ version: { $exists: false }, 'walletModules.TransferManager': '0xBC4eFE38e1C6172d587efCDE0f5B98a24f145911' }, { $set: { version: '1.4.0', paddedVersion: '0001.0004.0000' } })
    await db.collection('userwallets').updateMany({ version: { $exists: false }, 'walletModules.TransferManager': '0x2B3113B752645dfAFCe690706b5eCAd9d83977CF' }, { $set: { version: '1.5.0', paddedVersion: '0001.0005.0000' } })
  },

  async down (db, client) {
  }
}
