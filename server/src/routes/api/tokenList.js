const config = require('config')
const request = require('request-promise-native')
const router = require('express').Router()
const mongoose = require('mongoose')
const web3 = require('@services/web3')

const Event = mongoose.model('Event')
const Token = mongoose.model('Token')
const Bridge = mongoose.model('Bridge')

router.get('/home/:account', async (req, res, next) => {
  const account = req.params.account
  const urlBase = config.get('explorer.fuse.urlBase')
  const url = `${urlBase}?module=account&action=tokenlist&address=${account}`
  const response = JSON.parse(await request.get(url))

  const allFuseTokenAddresses = response.result.map(homeToken => web3.utils.toChecksumAddress(homeToken.contractAddress))
  const bridges = await Bridge.find({ homeTokenAddress: { $in: allFuseTokenAddresses } }, { foreignTokenAddress: 1 }).lean()

  const foreignTokenAddresses = bridges.map(bridge => bridge.foreignTokenAddress)
  const tokens = await Token.find({ address: { $in: foreignTokenAddresses } })

  res.json({
    object: 'list',
    data: tokens
  })
})

router.get('/foreign/:account', async (req, res, next) => {
  const account = req.params.account

  const events = await Event.aggregate([
    {
      $match: {
        eventName: 'Transfer',
        $or: [
          { 'returnValues.to': account },
          { 'returnValues.from': account }
        ]
      }
    },
    {
      $group: {
        _id: '$address'
      }
    }
  ])

  const addresses = events.map(ev => ev._id)
  const tokens = await Token.find({ address: { $in: addresses } })

  res.json({
    object: 'list',
    data: tokens
  })
})

module.exports = router
