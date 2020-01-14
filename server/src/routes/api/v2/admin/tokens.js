const router = require('express').Router()
const { toWei } = require('web3-utils')
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')

router.post('/mint', auth.required, async (req, res) => {
  const { isCommunityAdmin, accountAddress } = req.user
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }
  const { tokenAddress, networkType, amount } = req.body

  if (networkType !== 'fuse') {
    return res.status(400).send({ error: 'Supported only on Fuse Network' })
  }

  const amountInWei = toWei(amount.toString())
  const job = await agenda.now('mint', { tokenAddress, bridgeType: 'home', from: accountAddress, amount: amountInWei })
  return res.json({ job: job.attrs })
})

router.post('/burn', auth.required, async (req, res) => {
  const { isCommunityAdmin, accountAddress } = req.user
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }
  const { tokenAddress, networkType, amount } = req.body
  if (networkType !== 'fuse') {
    return res.status(400).send({ error: 'Supported only on Fuse Network' })
  }

  const amountInWei = toWei(amount)
  const job = await agenda.now('burn', { tokenAddress, bridgeType: 'home', from: accountAddress, amount: amountInWei })
  return res.json({ job: job.attrs })
})

module.exports = router
