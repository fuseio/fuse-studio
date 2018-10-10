process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
const config = require('config')
const utils = require('../../utils/metadata')

const testMetada = {
  some: 'value',
  num: 3
}

let metadataAns, metadataHash

const clearCollections = async () => {
  for (let collection in mongoose.connection.collections) {
    console.log('clear collection', collection)
    await mongoose.connection.collections[collection].remove({})
  }
}

const assertEqualMetadata = (meta1, meta2) => {
  assert.equal(meta1.hash, meta2.hash)
  assert.equal(meta1.protocol, meta2.protocol)
  Object.entries(meta1, async key => {
    assert.equal(meta1[key], meta2[key])
  })
}

describe('Metadata', async (accounts) => {
  before(async () => {
    await mongoose.connect(config.get('mongo.uri'), config.get('mongo.options'))
    await clearCollections()
  })

  it('should add metadata', async () => {
    metadataAns = await utils.addMetadata(testMetada)
    metadataHash = metadataAns.data.hash
    let dbAns = (await mongoose.metadata.getByHash(metadataHash)).toJSON()
    assertEqualMetadata(metadataAns.data, dbAns)
  })

  it('should add same metadata twice', async () => {
    metadataAns = await utils.addMetadata(testMetada)
    metadataHash = metadataAns.data.hash
    let dbAns = (await mongoose.metadata.getByHash(metadataHash)).toJSON()
    assertEqualMetadata(metadataAns.data, dbAns)
  })

  it('should get the metadadata from db/ipfs', async () => {
    let dbAns = await utils.getMetadata('ipfs', metadataHash)
    assertEqualMetadata(metadataAns.data, dbAns.data)
  })
})
