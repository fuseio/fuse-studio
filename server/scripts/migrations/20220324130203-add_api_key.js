const generateApiKey = require('generate-api-key')

module.exports = {
  async up (db) {
    const communities = await db.collection('communities').find({ apiKey: null }).toArray()
    console.log(`found ${communities.length} communities without apiKey`)
    for (let c of communities) {
      const apiKey = generateApiKey({ method: 'string' })
      await db.collection('communities').updateOne({ _id: c._id }, { $set: { apiKey: apiKey } })
    }
  },

  async down (db, client) {

  }
}
