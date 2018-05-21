const router = require('express').Router()
const mongoose = require('mongoose')
const IpfsAPI = require('ipfs-api')
const multer = require('multer')
const ipfsConfig = require('../../config').ipfs

const upload = multer()
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
      return res.json({data: {hash, protocol, metadata: JSON.parse(data.toString())}})
    } catch (e) {
      console.error(e)
      const metadataObj = await Metadata.findOne({protocol, hash})
      return res.json({data: metadataObj.toJSON()})
    }
  } else {
    const metadataObj = await Metadata.findOne({protocol, hash})
    return res.json({data: metadataObj.toJSON()})
  }
})

router.post('/', auth.required, async (req, res, next) => {
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

router.post('/image', auth.required, upload.single('image'), async (req, res) => {
  const filesAdded = await ipfs.files.add(req.file.buffer)
  const hash = filesAdded[0].hash

  return res.json({data: {hash}})
})

module.exports = router
