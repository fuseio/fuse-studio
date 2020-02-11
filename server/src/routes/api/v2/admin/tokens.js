const router = require('express').Router()
const { toWei } = require('web3-utils')
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')

/**
 * @api {post} /api/v2/admin/tokens/mint Mint tokens
 * @apiName Mint
 * @apiGroup Admin
 * @apiDescription Start async job of minting tokens
 * @apiExample Minting 1.1 tokens on Fuse network
 *  POST /api/v2/admin/tokens/mint
 *  body: { tokenAddress: '0xbAa75ecD3Ea911c78A23D7cD16961Eadc5867d2b', networkType: 'fuse', amount: '1.1' }
 * @apiParam {String} tokenAddress Token address to mint (body parameter)
 * @apiParam {String} networkType Token's network (must be Fuse)
 * @apiParam {String} amount Token amount to mint
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {String} Started job data
 */
router.post('/mint', auth.required, async (req, res) => {
  const { isCommunityAdmin, accountAddress } = req.user
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }
  const { tokenAddress, networkType, amount, toAddress } = req.body

  if (networkType !== 'fuse') {
    return res.status(400).send({ error: 'Supported only on Fuse Network' })
  }

  const amountInWei = toWei(amount.toString())
  const job = await agenda.now('mint', { tokenAddress, bridgeType: 'home', from: accountAddress, amount: amountInWei, toAddress })
  return res.json({ job: job.attrs })
})

/**
 * @api {post} /api/v2/admin/tokens/burn Burn tokens
 * @apiName Burn
 * @apiGroup Admin
 * @apiDescription Start async job of burning tokens
 * @apiExample Burn 1.1 tokens on Fuse network
 *  POST /api/v2/admin/tokens/burn
 *  body: { tokenAddress: '0xbAa75ecD3Ea911c78A23D7cD16961Eadc5867d2b', networkType: 'fuse', amount: '1.1' }
 * @apiParam {String} tokenAddress Token address to burn (body parameter)
 * @apiParam {String} networkType Token's network (must be Fuse)
 * @apiParam {String} amount Token amount to burn
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {String} Started job data
 */
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

/**
 * @api {post} /api/v2/admin/tokens/transfer Transfer tokens from account
 * @apiName Transfer
 * @apiGroup Admin
 * @apiDescription Start async job of transferring tokens from account (owned by community admin)
 * @apiExample Transfer 1.1 tokens on Fuse network
 *  POST /api/v2/admin/tokens/transfer
 *  body: { tokenAddress: '0xbAa75ecD3Ea911c78A23D7cD16961Eadc5867d2b', networkType: 'fuse', amount: '1.1', from: '0x755c33BE69dD2baB7286E7a2010fc8591AF15a1e', to: '0x5d651E34B6694A8778839441dA954Ece0EA733D8' }
 * @apiParam {String} tokenAddress Token address to transfer (body parameter)
 * @apiParam {String} networkType Token's network (must be Fuse)
 * @apiParam {String} amount Token amount to transfer
 * @apiParam {String} from account to transfer from
 * @apiParam {String} to address/account to transfer to
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {String} Started job data
 */
router.post('/transfer', auth.required, async (req, res) => {
  res.status(400).send({ error: 'not implemented yet' })
  const { isCommunityAdmin, accountAddress } = req.user
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }
  const { tokenAddress, networkType, amount, from, to } = req.body
  if (networkType !== 'fuse') {
    return res.status(400).send({ error: 'Supported only on Fuse Network' })
  }
  const amountInWei = toWei(amount)
  const job = await agenda.now('adminTransfer', { tokenAddress, bridgeType: 'home', from: accountAddress, amount: amountInWei, wallet: from, to })
  return res.json({ job: job.attrs })
})

module.exports = router
