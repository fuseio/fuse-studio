const router = require('express').Router()
const mongoose = require('mongoose')
const IpfsAPI = require('ipfs-api')
const race = require('async/race')
const config = require('config')

const ipfsConfig = config.get('ipfs')

const Metadata = mongoose.model('Metadata')

const ipfs = new IpfsAPI(ipfsConfig)

router.get('/:protocol/:hash', async (req, res, next) => {
  const protocol = req.params.protocol
  const hash = req.params.hash
  if (protocol === 'ipfs') {
    await race([
      (callback) => ipfs.files.cat(hash).then((data) => callback(null, data)),
      (callback) => setTimeout(() => callback(new Error('timeout'), null), ipfsConfig.timeout)
    ], async (err, data) => {
      if (err) {
        console.error(err)
        const metadataObj = await Metadata.findOne({protocol, hash})
        return res.json({source: 'mongo', data: metadataObj.toJSON()})
      }
      res.json({source: 'ipfs', data: {hash, protocol, metadata: JSON.parse(data.toString())}})
    })
  } else {
    const metadataObj = await Metadata.findOne({protocol, hash})
    return res.json({source: 'mongo', data: metadataObj.toJSON()})
  }
})

router.post('/', async (req, res, next) => {
  const metadata = Buffer.from(JSON.stringify(req.body.metadata))

  const filesAdded = await ipfs.files.add(metadata)
  const hash = filesAdded[0].hash

  const metadataObj = new Metadata({
    hash,
    metadata,
    protocol: 'ipfs'
  })

  try {
    await metadataObj.save()
    return res.json({data: metadataObj.toJSON()})
  } catch (error) {
    // duplication error, someone already added this hash to db
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.json({data: metadataObj.toJSON()})
    }
    throw error
  }
})

module.exports = router
