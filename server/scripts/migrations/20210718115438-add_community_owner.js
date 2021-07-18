module.exports = {
  async up (db) {
    const communities = await db.collection('communities').find({ owner: null }).toArray()
    for (let c of communities) {
      const accounts = await db.collection('useraccounts').find({ accountAddress: c.creatorAddress }).toArray()
      if (accounts.length > 0) {
        await db.collection('communities').updateOne({ _id: c._id }, { $set: { owner: accounts[0].studioUser } })
        c.owner = accounts[0].studioUser
      }
    }
  },

  async down (db, client) {

  }
}
