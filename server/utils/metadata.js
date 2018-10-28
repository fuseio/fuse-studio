const to = require('await-to-js').to
const mongoose = require('mongoose')
const config = require('config')
const IpfsAPI = require('ipfs-api')

require('../models')(mongoose)

const ipfsConfig = config.get('ipfs')
const ipfs = new IpfsAPI(ipfsConfig)

const utils = {}

const metadata = mongoose.metadata

utils.later = (delay, value) => {
  return new Promise(resolve => setTimeout(resolve, delay, value))
}

utils.getMetadata = async (protocol, hash) => {
  if (protocol === 'ipfs') {
    let data = await Promise.race([
      ipfs.files.cat(hash),
      utils.later(ipfsConfig.timeout)
    ])
    if (!data) {
      const metadataObj = await metadata.getByProtocolAndHash(protocol, hash)
      return {source: 'mongo', data: metadataObj.toJSON()}
    }
    return {source: 'ipfs', data: {hash, protocol, metadata: JSON.parse(data.toString())}}
  } else {
    const metadataObj = await metadata.getByProtocolAndHash(protocol, hash)
    return {source: 'mongo', data: metadataObj.toJSON()}
  }
}

utils.addMetadata = async (md) => {
  const metadataBuf = Buffer.from(JSON.stringify(md))
  const filesAdded = await ipfs.files.add(metadataBuf)
  const hash = filesAdded[0].hash

  let metadataObj = {
    hash,
    metadata: metadataBuf,
    protocol: 'ipfs'
  }

  let [error] = await to(metadata.create(metadataObj))
  metadataObj.metadata = JSON.parse(metadataObj.metadata.toString())
  // duplication error, someone already added this hash to db
  if (error) {
    console.log(error)
    if (error.name === 'MongoError' && error.code === 11000) {
      return {data: metadataObj}
    }
    throw error
  }
  console.log(`added ${metadataObj}`)
  return {data: metadataObj}
}

module.exports = utils
