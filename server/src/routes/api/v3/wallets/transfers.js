const config = require('config')
const router = require('express').Router()
const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')
const auth = require('@routes/auth')
const request = require('request-promise-native')
const { get, keyBy } = require('lodash')

const formatPending = ({ _id, data: { transactionBody, txHash } }) => ({
  jobId: _id,
  value: get(transactionBody, 'value', 0),
  tokenName: get(transactionBody, 'tokenName', ''),
  tokenDecimal: get(transactionBody, 'tokenDecimal', ''),
  tokenSymbol: get(transactionBody, 'asset', ''),
  tokenAddress: get(transactionBody, 'tokenAddress', ''),
  status: get(transactionBody, 'status', ''),
  type: get(transactionBody, 'type', ''),
  from: get(transactionBody, 'from', ''),
  to: get(transactionBody, 'to', ''),
  hash: txHash
})

const withJobs = async (transferEvents) => {
  const txHashesFromJobs = transferEvents.map(transferEvent => transferEvent.hash)
  const jobsFromWallet = await QueueJob.find({ 'data.txHash': { $in: txHashesFromJobs } })
  const jobsByTxHashes = keyBy(jobsFromWallet, 'data.txHash')
  return jobsByTxHashes
}

/**
 * @api {get} api/v3/wallets/transfers/tokentx/:walletAddress Get token transfer events by address on fuse
 * @apiName FetchTokenTxByAddress
 * @apiGroup Wallet
 * @apiParam {String} tokenAddress Address of the token
 * @apiParam {String} startblock The block number to start fetch from
 * @apiDescription Get token transfer events by address on fuse
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data Array of transfer events
 */
router.get('/tokentx/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const { tokenAddress, sort = 'desc', startblock = 0, page = 1, offset = 50, skip, limit } = req.query
  const responseTransferEvents = await request.get(`${config.get('explorer.fuse.urlBase')}?module=account&action=tokentx&contractaddress=${tokenAddress}&address=${walletAddress}&startblock=${startblock}&sort=${sort}&page=${page}&offset=${offset}`)
  const transferEvents = JSON.parse(responseTransferEvents)

  if (transferEvents['status'] === '1') {
    const hashesByJobs = await withJobs(transferEvents.result)
    const result = transferEvents.result.map(transferEvent => {
      if (transferEvent.from.toLowerCase() === walletAddress.toLowerCase()) {
        if (hashesByJobs[transferEvent.hash]) {
          return { ...transferEvent, jobId: hashesByJobs[transferEvent.hash]._id, status: 'confirmed' }
        }
        return { ...transferEvent, status: 'confirmed' }
      } else {
        return { ...transferEvent, status: 'confirmed' }
      }
    })

    const [pendingJobs] = await Promise.all([
      QueueJob.find({
        'data.walletAddress': walletAddress,
        'data.transactionBody': { '$exists': true },
        'data.transactionBody.status': 'pending',
        'data.transactionBody.tokenAddress': tokenAddress.toLowerCase()
      }).sort({ blockNumber: -1 }).limit(limit).skip(skip)
    ])

    const formatPendingJobs = pendingJobs.filter(item => !result.some(({ hash }) => hash === item.hash)).map((jobInfo) => formatPending(jobInfo))

    return res.json({ data: [...result, ...formatPendingJobs] })
  }

  return res.json({ data: [] })
})

module.exports = router
