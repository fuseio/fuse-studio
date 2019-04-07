const mongoose = require('mongoose')
const TokenProgress = mongoose.model('TokenProgress')

const stepDone = async (stepName, tokenAddress) => {
  await TokenProgress.findOneAndUpdate({tokenAddress}, {[`steps.${stepName}`]: true}, {upsert: true})
}

const steps = {
  tokenIssued: 'tokenIssued',
  bridgeDeployed: 'bridgeDeployed',
  detailsGiven: 'detailsGiven',
  businessListDeployed: 'businessListDeployed'
}

module.exports = {
  stepDone,
  steps,
  bridgeDeployed: stepDone.bind(null, steps.bridgeDeployed),
  tokenIssued: stepDone.bind(null, steps.tokenIssued),
  detailsGiven: stepDone.bind(null, steps.detailsGiven),
  businessListDeployed: stepDone.bind(null, steps.businessListDeployed)
}
