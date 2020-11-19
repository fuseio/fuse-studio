const config = require('config')
const router = require('express').Router()
const taskManager = require('@services/taskManager')

router.post('/:receiverAddress', async (req, res, next) => {
  const { receiverAddress } = req.params
  const networkName = req.body.networkName || 'ropsten'

  if (networkName !== 'fuse' && config.get('network.foreign.name') !== 'ropsten') {
    return res.status(404).json({ error: 'Funding available only for FUSE / Ropsten.' })
  }

  const job = await taskManager.now('ethFunder', { receiverAddress, networkName, rand: req.body.rand })
  return res.json({ job: job })
})

module.exports = router
