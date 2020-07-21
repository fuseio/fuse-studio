const router = require('express').Router()
const multer = require('multer')
const imageUtils = require('@utils/image')
const imageIpfsUtils = require('@utils/image/ipfs')
const { isIpfsHash } = require('@utils/metadata')

const upload = multer()

router.get('/:hash', async (req, res) => {
  const { hash } = req.params
  if (isIpfsHash(hash)) {
    return imageIpfsUtils.getImage(req, res)
  }
  return imageUtils.getImage(req, res)
})

router.post('/', upload.single('image'), async (req, res) => {
  return imageUtils.uploadImage(req, res)
})

module.exports = router
