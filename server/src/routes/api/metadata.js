const router = require('express').Router()
const metadataUtils = require('@utils/metadata')

router.get('/:hash', async (req, res) => {
  const hash = req.params.hash

  const metadata = await metadataUtils.getMetadata(hash)
  return res.json(metadata)
})

router.post('/', async (req, res, next) => {
  const body = await metadataUtils.createMetadata(req.body.metadata)
  return res.json(body)
})

module.exports = router
