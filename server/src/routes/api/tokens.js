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

  return tokens
    .filter((token) => token && token.address && communitiesByTokenAddress[token.address])
    .map((token) => ({ ...token.toObject(), communityAddress: communitiesByTokenAddress[token.address] ? communitiesByTokenAddress[token.address].communityAddress : undefined }))
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
 * @apiParam {String} networkType mainnet/ropsten/fuse
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
 * @api {get} /tokens/:address Fetch token
 * @apiName GetToken
 * @apiGroup Token
 * @apiDescription Tokens are compatible with the ERC20 standard, and they also can be burnable/mintable. Tokens are an important part of the community economy.
 *
 * @apiParam {String} address Token address
 *
 * @apiSuccess {String} address Token's address
 * @apiSuccess {String} name Token's name
 * @apiSuccess {String} symbol Token's symbol
 * @apiSuccess {String} tokenURI IPFS URI points to token metadata
 * @apiSuccess {String} totalSupply Token's total supply
 * @apiSuccess {String} owner Token's owner
 * @apiSuccess {String} factoryAddress Factory contract that created the token
 * @apiSuccess {String} blockNumber Block number of the token's creation
 * @apiSuccess {String} tokenType Token type: basic/mintableBurnable/impornted
 * @apiSuccess {String} networkType Network type where the token is issued: mainnet/ropsten/fuse
 */
router.get('/:address', async (req, res, next) => {
  const { address } = req.params
  const token = await Token.findOne({ address })
  return res.json({ data: token })
})

module.exports = router
