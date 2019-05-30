const mongoose = require('mongoose')
const CommunityProgress = mongoose.model('CommunityProgress')

const stepDone = async (stepName, tokenAddress) => {
  await CommunityProgress.findOneAndUpdate({ tokenAddress },
    { [`steps.${stepName}.done`]: true, $unset: { [`steps.${stepName}.errors`]: '' } })
}

const stepFailed = async (stepName, tokenAddress, error) => {
  console.error(error)
  await CommunityProgress.findOneAndUpdate({ tokenAddress }, { [`stepErrors.${stepName}`]: error }, { upsert: true })
}

const steps = {
  tokenIssued: 'tokenIssued',
  detailsGiven: 'detailsGiven',
  bridge: 'bridge',
  membersList: 'membersList'
}

module.exports = {
  stepDone,
  stepFailed,
  steps,
  bridgeDeployed: stepDone.bind(null, steps.bridge),
  tokenIssued: stepDone.bind(null, steps.tokenIssued),
  detailsGiven: stepDone.bind(null, steps.detailsGiven),
  businessListDeployed: stepDone.bind(null, steps.membersList)
}
