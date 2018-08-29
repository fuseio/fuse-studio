const router = require('express').Router()
const IpfsAPI = require('ipfs-api')
const multer = require('multer')
const config = require('config')

const ipfsConfig = config.get('ipfs')
const amazonConfig = config.get('amazon')

const upload = multer()

const ipfs = new IpfsAPI(ipfsConfig)

router.get('/:hash', async (req, res) => {
  const hash = req.params.hash

  let data
  try {
    data = await ipfs.files.cat(hash)
    res.set('Content-Type', 'image/png')
    return res.send(data)
  } catch (e) {
    return res.redirect(`${amazonConfig.apiBase}${hash}.png`)
  }
})

router.post('/', upload.single('image'), async (req, res) => {
  const filesAdded = await ipfs.files.add(req.file.buffer)
  const hash = filesAdded[0].hash

  return res.send({data: {hash}})
})

module.exports = router
