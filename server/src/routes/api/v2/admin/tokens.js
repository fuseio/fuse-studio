const config = require('config')
const router = require('express').Router()
const { toWei } = require('web3-utils')
const taskManager = require('@services/taskManager')
const auth = require('@routes/auth')
const moment = require('moment')
const mongoose = require('mongoose')
const Token = mongoose.model('Token')
const UserWallet = mongoose.model('UserWallet')
const QueueJob = mongoose.model('QueueJob')
const request = require('request-promise-native')
const Promise = require('bluebird')
const { toChecksumAddress } = require('web3-utils')
import isEmpty from 'lodash/isEmpty'

/**
 * @api {post} /api/v2/admin/tokens/create Create token
 * @apiName Create
 * @apiGroup Admin
 * @apiDescription Start async job of creating a token
 * @apiExample Create a token on Fuse network
 *  POST /api/v2/admin/tokens/create
 *  body: { name: 'MyCoolToken', symbol: 'MCT', initialSupply: '100', uri: 'ipfs://hash', expiryTimestamp: 1585036857, spendabilityIds: 'a,b,c', networkType: 'fuse' }
 * @apiParam {String} name Token name
 * @apiParam {String} symbol Token symbol
 * @apiParam {String} initialSupply Token initial supply (in ETH)
 * @apiParam {String} uri Token URI (metadata)
 * @apiParam {String} expiryTimestamp Token expiry timestamp after which cannot transfer (Unix epoch time - in seconds)
 * @apiParam {String} spendabilityIds Token spendability ids (comma-seperated list)
 * @apiParam {String} networkType Token's network (must be Fuse)
 *
 * @apiParam (Query) {String} apiKey API key is used to access the API
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {String} Started job data
 */
router.post('/create', auth.required, async (req, res) => {
  const { isCommunityAdmin, accountAddress } = req.user
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }
  const { name, symbol, initialSupply, uri, expiryTimestamp, spendabilityIds, correlationId } = req.body
  if (!name) {
    return res.status(400).send({ error: 'Missing name' })
  }
  if (!symbol) {
    return res.status(400).send({ error: 'Missing symbol' })
  }
  const initialSupplyInWei = toWei((initialSupply || 0).toString())
  const tokenURI = uri || ''
  if (!expiryTimestamp) {
    expiryTimestamp = 2524608000
  }
  const now = moment().unix()
  if (expiryTimestamp < now) {
    return res.status(400).send({ error: 'Invalid expiryTimestamp - before current time' })
  }
  const spendabilityIdsArr = spendabilityIds ? spendabilityIds.split(',') : []
  try {
    const job = await taskManager.now('createToken', { bridgeType: 'home', accountAddress, name, symbol, initialSupplyInWei, tokenURI, expiryTimestamp, spendabilityIdsArr, correlationId })
    return res.json({ job })
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
})

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
 * @apiParam {String} toAddress account to transfer to
 *
 * @apiParam (Query) {String} apiKey API key is used to access the API
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {String} Started job data
 */
router.post('/mint', auth.required, async (req, res) => {
  const { isCommunityAdmin, accountAddress, role } = req.user
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }
  const { tokenAddress, amount, toAddress, correlationId } = req.body
  try {
    const amountInWei = toWei(amount.toString())
    const taskExectionParams = role ? { role } : { accountAddress }
    const job = await taskManager.now('mint', { tokenAddress, bridgeType: 'home', ...taskExectionParams, amount: amountInWei, toAddress, correlationId })
    return res.json({ job })
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
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
 * @apiParam {String} from account to burn from (optional)
 *
 * @apiParam (Query) {String} apiKey API key is used to access the API
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
  const { tokenAddress, amount, from, correlationId, spendabilityIds, spendabilityOrder } = req.body
  try {
    const amountInWei = toWei(amount)
    let job
    if (tokenAddress) {
      if (!from) {
        job = await taskManager.now('burn', { tokenAddress, bridgeType: 'home', accountAddress, amount: amountInWei, correlationId })
      } else {
        job = await taskManager.now('adminApprove', { tokenAddress, bridgeType: 'home', accountAddress, amount: amountInWei, wallet: from, spender: accountAddress, burnFromAddress: from, correlationId: correlationId ? `${correlationId}-1` : correlationId })
      }
    } else {
      const spendabilityIdsArr = spendabilityIds ? spendabilityIds.split(',') : []
      if (spendabilityIdsArr.length > 0 && (!spendabilityOrder || (spendabilityOrder !== 'asc' && spendabilityOrder !== 'desc'))) {
        return res.status(400).send({ error: 'Missing spendabilityOrder' })
      }
      const tokens = await mongoose.token.getBySpendability('home', spendabilityIdsArr, spendabilityOrder === 'asc' ? 1 : -1)
      if (!tokens || !tokens.length) {
        return res.status(400).send({ error: `Could not find tokens for spendabilityIds: ${spendabilityIds}` })
      }
      const tokenAddresses = tokens.map(t => t.address)
      job = await taskManager.now('adminSpendabilityApprove', { tokenAddresses, bridgeType: 'home', accountAddress, amount: amountInWei, wallet: from, spender: accountAddress, burnFromAddress: from, correlationId: `${correlationId}-1` })
    }
    return res.json({ job })
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
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
 * @apiParam {String} spendabilityIds Token spendability ids (comma-seperated list) - if sent, no need for tokenAddress
 * @apiParam {String} spendabilityOrder Token spendability order (asc/desc) - mandatory if using spendabilityIds
 * @apiParam {String} tokenAddress Token address to transfer (body parameter)
 * @apiParam {String} networkType Token's network (must be Fuse)
 * @apiParam {String} amount Token amount to transfer
 * @apiParam {String} from account to transfer from
 * @apiParam {String} to address to transfer to
 *
 * @apiParam (Query) {String} apiKey API key is used to access the API
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {String} Started job data
 */
router.post('/transfer', auth.required, async (req, res) => {
  const { isCommunityAdmin, accountAddress } = req.user
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }
  const { tokenAddress, amount, from, to, correlationId, spendabilityIds, spendabilityOrder } = req.body
  const amountInWei = toWei(amount)
  if (tokenAddress) {
    try {
      const job = await taskManager.now('adminTransfer', { tokenAddress, bridgeType: 'home', accountAddress, amount: amountInWei, wallet: from, to, correlationId })
      return res.json({ job })
    } catch (err) {
      return res.status(400).send({ error: err.message })
    }
  } else {
    try {
      const spendabilityIdsArr = spendabilityIds ? spendabilityIds.split(',') : []
      if (!spendabilityIdsArr.length) {
        return res.status(400).send({ error: 'Missing spendabilityIds' })
      }
      if (!spendabilityOrder || (spendabilityOrder !== 'asc' && spendabilityOrder !== 'desc')) {
        return res.status(400).send({ error: 'Missing spendabilityOrder' })
      }
      const tokens = await mongoose.token.getBySpendability('home', spendabilityIdsArr, spendabilityOrder === 'asc' ? 1 : -1)
      if (!tokens || !tokens.length) {
        return res.status(400).send({ error: `Could not find tokens for spendabilityIds: ${spendabilityIds}` })
      }
      const tokenAddresses = tokens.map(t => t.address)
      const job = await taskManager.now('adminSpendabilityTransfer', { tokenAddresses, bridgeType: 'home', accountAddress, amount: amountInWei, wallet: from, to, correlationId: `${correlationId}-1` })
      return res.json({ job })
    } catch (err) {
      return res.status(400).send({ error: err.message })
    }
  }
})

/**
 * @api {post} /api/v2/admin/tokens/expired Get expired by wallet/token/spendabilityId
 * @apiName Expired
 * @apiGroup Admin
 * @apiDescription Get expired balance for one/multiple wallets by token or spendabilityId
 * @apiExample
 *  GET /api/v2/admin/tokens/expired
 *  body: { walletAddress: '0x755c33BE69dD2baB7286E7a2010fc8591AF15a1e', tokenAddress: '0xbAa75ecD3Ea911c78A23D7cD16961Eadc5867d2b', networkType: 'fuse' }
 * @apiParam {String} walletAddress
 * @apiParam {String} tokenAddress
 * @apiParam {String} spendabilityId
 * @apiParam {String} networkType Token's network (must be Fuse)
 *
 * @apiParam (Query) {String} apiKey API key is used to access the API 
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 */
router.post('/expired', auth.required, async (req, res) => {
  const { isCommunityAdmin, accountAddress } = req.user
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }
  const { networkType, walletAddress, tokenAddress, spendabilityId } = req.body
  console.log(`/admin/tokens/expired`, { networkType, walletAddress, tokenAddress, spendabilityId })
  if (networkType !== 'fuse') {
    return res.status(400).send({ error: 'Supported only on Fuse Network' })
  }
  try {
    let result
    let wallets = walletAddress ? [await UserWallet.findOne({ walletAddress })] : await UserWallet.find({ walletOwnerOriginalAddress: accountAddress }, { _id: 0, walletAddress: 1 })
    wallets = wallets.filter(wallet => wallet.walletAddress).map(wallet => wallet.walletAddress)
    if (!wallets || wallets.length === 0) {
      return res.status(400).send({ error: 'Wallets not found' })
    }
    if (tokenAddress) {
      result = await expiredByToken(tokenAddress, wallets)
    } else if (spendabilityId) {
      result = await expiredBySpendabilityId(spendabilityId, wallets)
    } else {
      return res.status(400).send({ error: 'Missing tokenAddress/spendabilityId' })
    }
    result = result.filter(obj => obj.data && obj.data.length)
    return res.json({ result })
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }

  async function expiredByToken (tokenAddress, wallets) {
    console.log(`/admin/tokens/expired -> expiredByToken`, tokenAddress, wallets)
    const now = moment().unix()
    const token = await mongoose.token.getByAddress(tokenAddress)
    if (token.expiryTimestamp > now) {
      throw new Error(`Token ${tokenAddress} is not expired yet (expiry at ${token.expiryTimestamp})`)
    }
    const result = await Promise.map(wallets, wallet => {
      return new Promise(resolve => {
        getAccountTokenList(wallet, [tokenAddress.toLowerCase()])
          .then(result => {
            resolve(result)
          })
      })
    }, { concurrency: 10 })
    return result
  }

  async function expiredBySpendabilityId (spendabilityId, wallets) {
    console.log(`/admin/tokens/expired -> expiredBySpendabilityId`, spendabilityId, wallets)
    const now = moment().unix()
    const tokens = await Token.find({ networkType: 'home', spendabilityIds: spendabilityId }, { _id: 0, address: 1, expiryTimestamp: 1 })
    if (!tokens || !tokens.length) {
      throw new Error(`Could not find tokens for spendabilityId: ${spendabilityId}`)
    }
    const expiredTokens = tokens.filter(t => t.expiryTimestamp < now).map(t => t.address.toLowerCase())
    if (!expiredTokens || !expiredTokens.length) {
      throw new Error(`Could not find expired tokens for spendabilityId: ${spendabilityId}`)
    }
    console.log(`the expired tokens are: ${expiredTokens}`)

    const result = await Promise.map(wallets, wallet => {
      return new Promise(resolve => {
        getAccountTokenList(wallet, expiredTokens)
          .then(result => {
            resolve(result)
          })
      })
    }, { concurrency: 10 })
    return result
  }

  async function getAccountTokenList (address, tokens) {
    try {
      console.log(`/admin/tokens/expired -> getAccountTokenList`, address)
      const res = await request.get(`${config.get('explorer.fuse.urlBase')}?module=account&action=tokenlist&address=${address}`)
      const data = JSON.parse(res)
      const accountTokens = data.result.filter(obj => obj.balance !== '0' && tokens.includes(obj.contractAddress)).map(obj => {
        return { tokenAddress: obj.contractAddress, balance: obj.balance }
      })
      return { wallet: address, data: accountTokens }
    } catch (err) {
      throw err
    }
  }
})

/**
 * @api {post} /api/v2/admin/tokens/burnEvents Get burn events
 * @apiName BurnEvents
 * @apiGroup Admin
 * @apiDescription Get burn events created by admin
 * @apiExample
 *  GET /api/v2/admin/tokens/burnEvents
 *  body: { fromWallet: '0x755c33BE69dD2baB7286E7a2010fc8591AF15a1e', networkType: 'fuse' }
 * @apiParam {String} fromWallet
 * @apiParam {String} startTime
 * @apiParam {String} endTime
 * @apiParam {String} networkType Token's network (must be Fuse)
 *
 * @apiParam (Query) {String} apiKey API key is used to access the API
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 */
router.post('/burnEvents', auth.required, async (req, res) => {
  const { isCommunityAdmin, accountAddress } = req.user
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }
  const { networkType, fromWallet, startTime, endTime } = req.body
  console.log(`/admin/tokens/expired`, { networkType, fromWallet, startTime, endTime })
  if (networkType !== 'fuse') {
    return res.status(400).send({ error: 'Supported only on Fuse Network' })
  }
  const filter = { name: 'burnFrom', 'data.from': accountAddress }
  if (fromWallet) {
    filter['data.burnFromAddress'] = fromWallet
  }
  if (startTime) {
    filter.lastFinishedAt = { $gt: moment(parseInt(startTime)).unix() }
  }
  if (endTime) {
    filter.lastFinishedAt = { $lt: moment(parseInt(endTime)).unix() }
  }
  const jobs = await QueueJob.find(filter)
  if (!jobs || jobs.length === 0 || !jobs[0]) {
    return res.status(404).json({ error: 'No burn events found' })
  }
  const result = await Promise.map(jobs, job => {
    return new Promise(async resolve => {
      const token = await Token.findOne({ address: toChecksumAddress(job.data.tokenAddress) }, { _id: 0, spendabilityIds: 1, expiryTimestamp: 1 })
      resolve({
        fromWallet: job.data.burnFromAddress,
        tokenAddress: job.data.tokenAddress,
        spendabilityIds: token && token.spendabilityIds,
        amount: job.data.amount,
        timestamp: job.lastFinishedAt,
        expired: token && token.expiryTimestamp && moment(token.expiryTimestamp).isBefore(job.lastFinishedAt),
        txHash: job.data.txHash,
        correlationId: job.data.correlationId
      })
    })
  }, { concurrency: 10 })
  return res.json({ result })
})

module.exports = router
