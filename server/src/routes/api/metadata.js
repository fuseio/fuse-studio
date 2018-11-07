const router = require('express').Router()

const utils = require('../../utils/metadata')

router.get('/:protocol/:hash', async (req, res, next) => {
  const protocol = req.params.protocol
  const hash = req.params.hash
  const metadata = await utils.getMetadata(protocol, hash)
  res.json(metadata)
})

router.post('/', async (req, res, next) => {
  res.json(await utils.addMetadata(req.body.metadata))
})

module.exports = router
