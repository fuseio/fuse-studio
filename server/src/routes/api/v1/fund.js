const config = require('config')
const router = require('express').Router()
const { agenda } = require('@services/agenda')

router.post('/:accountAddress', async (req, res, next) => {
  const { accountAddress } = req.params
  const networkName = req.body.networkName || 'ropsten'

  // config.get('network.home.name')
  if (networkName !== 'fuse' && config.get('network.foreign.name') !== 'ropsten') {
    return res.status(404).json({ error: 'Funding available only for FUSE / Ropsten.' })
  }

  const job = await agenda.now('ethFunder', { accountAddress, networkName })
  return res.json({ job: job.attrs })
})

module.exports = router
