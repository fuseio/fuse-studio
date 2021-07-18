module.exports = {
  async up (db) {
    const communities = await db.collection('communities').find({ owner: null }).toArray()
    console.log(`found ${communities.length} communities without owner`)
    for (let c of communities) {
      const accounts = await db.collection('useraccounts').find({ accountAddress: c.creatorAddress }).toArray()
      if (accounts.length > 0) {
        console.log(`updating community ${c.communityAddress}`)
        await db.collection('communities').updateOne({ _id: c._id }, { $set: { owner: accounts[0].studioUser } })
        c.owner = accounts[0].studioUser
      }
    }
  },

  async down (db, client) {

  }
}
