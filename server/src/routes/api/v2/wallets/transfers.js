const config = require('config')
const router = require('express').Router()
const mongoose = require('mongoose')
const AgendaJob = mongoose.model('AgendaJob')
const auth = require('@routes/auth')
const request = require('request-promise-native')
const Promise = require('bluebird')
const { get } = require('lodash')

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

/**
 * @api {get} api/v2/wallets/transfers/tokentx/:walletAddress Get token transfer events by address on fuse
 * @apiName FetchTokenTxByAddress
 * @apiGroup Wallet
 * @apiDescription Get token transfer events by address on fuse
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data Array of transfer events
 */
router.get('/tokentx/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const { tokenAddress, sort = 'desc', startblock = 0 } = req.query
  const responseTransferEvents = await request.get(`${config.get('explorer.fuse.urlBase')}?module=account&action=tokentx&contractaddress=${tokenAddress}&address=${walletAddress}&startblock=${startblock}&sort=${sort}`)
  const transferEvents = JSON.parse(responseTransferEvents)

  if (transferEvents['status'] === '1') {
    const result = await Promise.map(transferEvents['result'], transferEvent => {
      return new Promise(resolve => {
        if (transferEvent.from.toLowerCase() === walletAddress.toLowerCase()) {
          AgendaJob.findOne({
            'data.txHash': transferEvent.hash
          }).then(job => {
            resolve({ ...transferEvent, jobId: job._id, status: 'confirmed' })
          })
        } else {
          resolve({ ...transferEvent, status: 'confirmed' })
        }
      })
    }, { concurrency: 10 })

    const pendingJobs = await AgendaJob.find({
      'data.walletAddress': walletAddress,
      'data.transactionBody': { '$exists': true },
      'data.transactionBody.status': 'pending',
      'data.transactionBody.tokenAddress': tokenAddress.toLowerCase()
    })

    const formatPendingJobs = pendingJobs.filter(item => !result.some(({ hash }) => hash === item.hash)).map((jobInfo) => formatPending(jobInfo))

    return res.json({ data: [...result, ...formatPendingJobs] })
  }

  return res.json({ data: [] })
})

module.exports = router
