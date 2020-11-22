const router = require('express').Router()
const mongoose = require('mongoose')
const { createAccount, generateCommunityAdminJwt } = require('@utils/account')
const auth = require('@routes/auth')
const Account = mongoose.model('Account')
const taskManager = require('@services/taskManager')
/**
 * @api {get} api/v2/accounts/ Fetch backend accounts
 * @apiName FetchAccounts
 * @apiGroup Accounts
 * @apiDescription Fetch backend accounts
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 *
 * @apiSuccess {Object[]} accounts list
 */
router.get('/', auth.admin, async (req, res) => {
  const accounts = await Account.find({ }).lean()
  return res.json({ data: accounts })
})

/**
 * @api {post} api/v2/accounts/ Create backend account
 * @apiName FetchAccounts
 * @apiGroup Accounts
 * @apiDescription Create backend account
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiParam {String} role Account role
 * @apiParam {String} bridgeType Account bridgeType
 * @apiParam {String} description Account description
 * @apiParam {String} appName wallet application if the account uses a wallet app
 * @apiParamExample {json} Request-Example:
 *   {
 *      "role": "wallet",
 *      "bridgeType": "home"
 *      "description": "Wallet account"
 *    }
 * @apiSuccess {Object} created account and the jwt if needed
 */
router.post('/', auth.admin, async (req, res) => {
  const { role, bridgeType, description, appName } = req.body
  const account = await createAccount({ role, bridgeType, description })
  if (role === 'communityAdmin') {
    const jwt = generateCommunityAdminJwt(account.address, appName)
    return res.json({ data: { account, jwt } })
  } else if (role === 'wallet' && bridgeType === 'home') {
    taskManager.now('addManager', { managerAccountAddress: account.address })
  }
  return res.json({ data: { account } })
})

module.exports = router
