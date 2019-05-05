const mongoose = require('mongoose')
const TokenProgress = mongoose.model('TokenProgress')

const stepDone = async (stepName, tokenAddress) => {
  await TokenProgress.findOneAndUpdate({ tokenAddress },
    { [`steps.${stepName}`]: true, $unset: { [`stepErrors.${stepName}`]: '' } },
    { upsert: true })
}

const addError = async (stepName, tokenAddress, error) => {
  console.error(error)
  await TokenProgress.findOneAndUpdate({ tokenAddress }, { [`stepErrors.${stepName}`]: error }, { upsert: true })
}

const steps = {
  tokenIssued: 'tokenIssued',
  detailsGiven: 'detailsGiven',
  bridge: 'bridge',
  membersList: 'membersList'
}

module.exports = {
  stepDone,
  addError,
  steps,
  bridgeDeployed: stepDone.bind(null, steps.bridge),
  tokenIssued: stepDone.bind(null, steps.tokenIssued),
  detailsGiven: stepDone.bind(null, steps.detailsGiven),
  businessListDeployed: stepDone.bind(null, steps.membersList)
}
