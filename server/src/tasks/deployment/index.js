const mongoose = require('mongoose')
const { get } = require('lodash')
const { withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')

const { deployCommunity } = require('./community')
const { funder } = require('./funder')
const { onboardUser } = require('./email')
const CommunityProgress = mongoose.model('CommunityProgress')
const Community = mongoose.model('Community')

const stepFunctions = {
  community: deployCommunity,
  funder,
  email: onboardUser
}

const stepsOrder = ['community', 'funder', 'email']

const mandatorySteps = {
  bridge: false,
  community: true,
  transferOwnership: false,
  funder: false,
  email: false
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

  if (!currentStep) {
    if (mandatorySteps[stepName]) {
      throw stepFailed(`step ${stepName} should be mandatory`)
    } else {
      return communityProgress
    }
  }

  if (communityProgress.steps[stepName].done) {
    console.log(`${stepName} already deployed`)
  } else {
    try {
      console.log(`starting step ${stepName}`)
      const deployFunction = stepFunctions[stepName]
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
const deploy = withAccount(async (account, { communityProgressId }) => {
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
    const { name, communityURI, plugins, description, adminAddress, customData } = steps.community.args
    await new Community({
      plugins,
      customData,
      communityAddress,
      isClosed,
      foreignTokenAddress: get(steps, 'bridge.args.foreignTokenAddress'),
      name,
      communityURI,
      description,
      creatorAddress: adminAddress
    }).save()

    await CommunityProgress.findByIdAndUpdate(communityProgress._id, { communityAddress, done: true })

    console.log('Community deploy is done')
  } catch (error) {
    console.log('Community deploy failed')
    throw error
  }
})

module.exports = {
  deploy
}
