const router = require('express').Router()
const config = require('config')
const metadataUtils = require('@utils/metadata')
const ipfsUtils = require('@utils/metadata/ipfs')

router.get('/:hash', async (req, res) => {
  const hash = req.params.hash

  let metadata
  if (ipfsUtils.isIpfsHash(hash)) {
    metadata = await ipfsUtils.getMetadata(hash)
  } else {
    metadata = await metadataUtils.getMetadata(hash)
  }
  return res.json(metadata)
})

router.post('/', async (req, res, next) => {
  const apiBase = `${config.get('api.protocol')}://${req.headers.host}${req.baseUrl}`
  const body = await metadataUtils.createMetadata(req.body.metadata, apiBase)
  return res.json(body)
})

module.exports = router
