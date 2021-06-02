const mongoose = require('mongoose')
const config = require('config')
const { get } = require('lodash')
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
const deployEconomy = async (account, { communityProgressId, owner }) => {
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
      foreignNetworkType: get(steps, 'community.args.foreignTokenAddress', null) && config.get('network.foreign.name'),
      foreignTokenAddress: get(steps, 'community.args.foreignTokenAddress', null),
      homeTokenAddress: get(steps, 'community.args.homeTokenAddress', null),
      name,
      communityURI,
      description,
      creatorAddress: adminAddress,
      owner,
      bridgeDirection: get(steps, 'community.args.foreignTokenAddress') && 'foreign-to-home',
      bridgeType: get(steps, 'community.args.foreignTokenAddress') && 'multi-amb-erc20-to-erc677'
    }).save()

    await CommunityProgress.findByIdAndUpdate(communityProgress._id, { communityAddress, done: true })

    console.log('Community deploy is done')
  } catch (error) {
    console.log('Community deploy failed')
    throw error
  }
}

module.exports = {
  deployEconomy
}
