const router = require('express').Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { getAdmin } = require('@services/firebase')

/**
 * @api {post} api/v2/login/wallet/firebase/verify Login using firebase ID token
 * @apiName Login
 * @apiGroup Login
 * @apiDescription Login using firebase ID token
 *
 * @apiParam {String} accountAddress User account address
 * @apiParam {String} token Firebase ID token
 * @apiParam {String} identifier Phone device identifier
 * @apiParam {String} appName firebase app name the user is connecting to. optional

 *
 * @apiSuccess {String} token JWT token
 */
router.post('/verify', async (req, res) => {
  const { accountAddress, token, identifier, appName } = req.body
  const manager = getAdmin(appName)
  manager.auth().verifyIdToken(token)
    .then(decodedToken => {
      const secret = config.get('api.secret')
      const expiresIn = config.get('api.tokenExpiresIn')
      const data = { phoneNumber: decodedToken.phone_number, accountAddress, uid: decodedToken.uid, appName, verifiedBy: 'firebase' }
      if (identifier) {
        data.identifier = identifier
      }
      const token = jwt.sign(data, secret, { expiresIn })
      res.json({ token })
    }).catch(err => {
      console.error('Login error', err)
      res.status(400).json({ error: 'Login failed' })
    })
})

module.exports = router
