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

/**
 * @api {get} /tokens Fetch tokens
 * @apiName GetTokens
 * @apiGroup Token
 *
 * @apiParam {String} networkType Mainnet/Ropsten/Fuse
 * @apiParam {Number} page Page number for pagination
 *
 * @apiSuccess {Object[]} - List of Tokens. See GetToken endpoint for token fields
 */
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

/**
 * @api {get} /tokens/owner/:owner Fetch tokens by owner
 * @apiName GetTokensByOwner
 * @apiGroup Token
 *
 * @apiParam {String} owner account address of the token owner
 * @apiParam {String} networkType Mainnet/Ropsten/Fuse
 *
 * @apiSuccess {Object[]} - List of Tokens. See GetToken endpoint for token fields
 */
router.get('/owner/:owner', async (req, res) => {
  const { owner } = req.params
  const results = await Token.find({ ...createFilter(req.query), owner }).sort({ blockNumber: -1 })

  res.json({
    object: 'list',
    data: await withCommunityAddress(results, req.query)
  })
})

/**
 * @api {get} /tokens/:address Fetch token by token address
 * @apiName GetToken
 * @apiGroup Token
 *
 * @apiParam {String} address Token address
 *
 * @apiSuccess {String} address
 * @apiSuccess {String} name
 * @apiSuccess {String} symbol
 * @apiSuccess {String} tokenURI IPFS URI points to token metadata
 * @apiSuccess {String} totalSupply
 * @apiSuccess {String} owner
 * @apiSuccess {String} factoryAddress Factory contract that created the token
 * @apiSuccess {String} blockNumber
 * @apiSuccess {String} tokenType basic/mintableBurnable/impornted
 * @apiSuccess {String} networkType Mainnet/Ropsten/Fuse
 */
router.get('/:address', async (req, res, next) => {
  const { address } = req.params
  const token = await Token.findOne({ address })
  return res.json({ data: token })
})

module.exports = router
