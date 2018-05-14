const router = require('express').Router()
const IpfsAPI = require('ipfs-api')
const multer = require('multer')
const ipfsConfig = require('../../config').ipfs

const upload = multer()
const auth = require('../auth')

const ipfs = new IpfsAPI(ipfsConfig)

router.get('/:hash', async (req, res) => {
  const hash = req.params.hash

  const data = await ipfs.files.cat(hash)

  res.set('Content-Type', 'image/jpeg')
  return res.send(data)
})

router.post('/', auth.required, upload.single('image'), async (req, res) => {
  const filesAdded = await ipfs.files.add(req.file.buffer)
  const hash = filesAdded[0].hash

  return res.send({data: {hash}})
})

module.exports = router
