const router = require('express').Router()
const mongoose = require('mongoose')
const TokenProgress = mongoose.model('TokenProgress')
const deploy = require('@utils/tokenProgress/deploy')

router.get('/:tokenAddress', async (req, res, next) => {
  const { tokenAddress } = req.params
  const tokenProgress = await TokenProgress.findOne({ tokenAddress })
  return res.json({ data: tokenProgress })
})

router.post('/deploy/:tokenAddress', async (req, res, next) => {
  const { tokenAddress } = req.params
  const { steps } = req.body

  const tokenProgress = await TokenProgress.findOne({ tokenAddress })
  if (!tokenProgress || !tokenProgress.steps.tokenIssued) {
    return res.status(400).json({ errror: 'No token issued' })
  }

  deploy(tokenProgress, { ...steps, transferOwnership: true })

  return res.json({ data: tokenProgress })
})

module.exports = router
