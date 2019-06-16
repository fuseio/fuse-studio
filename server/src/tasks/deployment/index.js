const mongoose = require('mongoose')
const { lockAccount, unlockAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')

const { deployBridge } = require('./bridge')
const { deployCommunity } = require('./community')
const { transferOwnership } = require('./token')
const CommunityProgress = mongoose.model('CommunityProgress')
const Community = mongoose.model('Community')

const deployFunctions = {
  community: deployCommunity,
  bridge: deployBridge,
  transferOwnership
}

const stepsOrder = ['community', 'bridge', 'transferOwnership']

const mandatorySteps = {
  bridge: true,
  community: true,
  transferOwnership: true
}

const performStep = async ({ home, foreign }, communityProgress, stepName) => {
  const currentStep = communityProgress.steps[stepName]

  const stepFailed = async (errorMsg, error) => {
    console.log(errorMsg)
    await CommunityProgress.findByIdAndUpdate(communityProgress._id,
      { [`steps.${stepName}`]: { ...currentStep, done: false, error: errorMsg } },
      { new: true })
    return error || Error(errorMsg)
  }

  if (!currentStep && mandatorySteps[stepName]) {
    throw stepFailed(`step ${stepName} should be mandatory`)
  }

  if (communityProgress.steps[stepName].done) {
    console.log(`${stepName} already deployed`)
  } else {
    try {
      console.log(`starting step ${stepName}`)
      const deployFunction = deployFunctions[stepName]
      const results = await deployFunction({ home, foreign }, communityProgress)
      console.log(`step ${stepName} done`)
      return CommunityProgress.findByIdAndUpdate(communityProgress._id,
        { [`steps.${stepName}`]: { ...currentStep, done: true, results } },
        { new: true })
    } catch (error) {
      throw stepFailed(`step ${stepName} failed`, error)
    }
  }
}
const deploy = async ({ communityProgressId }) => {
  const account = await lockAccount()

  if (!account) {
    throw new Error('no unlocked accounts available')
  }

  try {
    let communityProgress = await CommunityProgress.findById(communityProgressId)

    const home = createNetwork('home', account)
    const foreign = createNetwork('foreign', account)

    communityProgress = await CommunityProgress.findByIdAndUpdate(communityProgress._id, { account })

    for (let stepName of stepsOrder) {
      communityProgress = await performStep({ home, foreign }, communityProgress, stepName)
    }

    const { steps } = communityProgress
    const { communityAddress, isClosed } = steps.community.results
    const { homeTokenAddress, foreignTokenAddress, foreignBridgeAddress, homeBridgeAddress } = steps.bridge.results

    new Community({
      communityAddress,
      isClosed,
      homeTokenAddress,
      foreignTokenAddress,
      foreignBridgeAddress,
      homeBridgeAddress
    }).save()

    await CommunityProgress.findByIdAndUpdate(communityProgress._id, { communityAddress, done: true })

    await unlockAccount(account.address)
    console.log('Community deploy is done')
  } catch (error) {
    await unlockAccount(account.address)
    console.log('Community deploy failed')
    throw error
  }
}

module.exports = {
  deploy
}
