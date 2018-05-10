const router = require('express').Router()
const mongoose = require('mongoose')
const IpfsAPI = require('ipfs-api')
const ipfsConfig = require('../../config').ipfs

const auth = require('../auth')
const Metadata = mongoose.model('Metadata')

const ipfs = new IpfsAPI(ipfsConfig)

router.get('/:protocol/:hash', async (req, res, next) => {
  const protocol = req.params.protocol
  const hash = req.params.hash
  let data
  if (protocol === 'ipfs') {
    try {
      data = await ipfs.files.cat(hash)
      return res.json({data: {hash, protocol, data: JSON.parse(data.toString())}})
    } catch (e) {
      console.error(e)
      const metadata = await Metadata.findOne({protocol, hash})
      return res.json({data: metadata.toJSON()})
    }
  } else {
    const metadata = await Metadata.findOne({protocol, hash})
    return res.json({data: metadata.toJSON()})
  }
})

router.post('/', auth.required, async (req, res, next) => {
  const data = Buffer.from(JSON.stringify(req.body.metadata))

  const filesAdded = await ipfs.files.add(data)
  const hash = filesAdded[0].hash

  const metadata = new Metadata({
    hash,
    data,
    protocol: 'ipfs'
  })

  try {
    console.log('hello')
    await metadata.save()
    console.log('after')
    return res.json({data: metadata.toJSON()})
  } catch (error) {
    // duplication error, someone already added this hash to db
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.json({data: metadata.toJSON()})
    }
    console.log('error')
    throw error
  }
})

module.exports = router
