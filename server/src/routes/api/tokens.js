const router = require('express').Router()
const mongoose = require('mongoose')
const Token = mongoose.model('Token')
const Community = mongoose.model('Community')
const paginate = require('express-paginate')
const { keyBy } = require('lodash')

const withCommunityAddress = async (tokens, { networkType }) => {
  if (!networkType) {
    return tokens
  }

  const tokenAddresses = tokens.map(token => token.address)
  const key = networkType === 'fuse' ? 'homeTokenAddress' : 'foreignTokenAddress'
  const communities = await Community.find({ [key]: { $in: tokenAddresses } })
  const communitiesByTokenAddress = keyBy(communities, key)

  return tokens.map((token) => ({ ...token.toObject(), communityAddress: communitiesByTokenAddress[token.address] ? communitiesByTokenAddress[token.address].communityAddress : undefined }))
}

const createFilter = ({ networkType }) => networkType ? ({ networkType }) : {}

router.get('/', async (req, res) => {
  const [ results, itemCount ] = await Promise.all([
    Token.find(createFilter(req.query)).sort({ blockNumber: -1 }).limit(req.query.limit).skip(req.skip),
    Token.estimatedDocumentCount()
  ])

  const pageCount = Math.ceil(itemCount / req.query.limit)

  res.json({
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    data: await withCommunityAddress(results, req.query)
  })
})

router.get('/owner/:owner', async (req, res) => {
  const { owner } = req.params
  const results = await Token.find({ ...createFilter(req.query), owner }).sort({ blockNumber: -1 })

  res.json({
    object: 'list',
    data: await withCommunityAddress(results, req.query)
  })
})

router.get('/:address', async (req, res, next) => {
  const { address } = req.params
  const token = await Token.findOne({ address })
  return res.json({ data: token })
})

module.exports = router
