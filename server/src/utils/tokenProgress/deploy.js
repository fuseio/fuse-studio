const mongoose = require('mongoose')
const { deployBridge } = require('@utils/bridge')
const { deployCommunity } = require('@utils/community')
const { stepFailed, stepDone } = require('@utils/tokenProgress')
const { transferOwnership } = require('@utils/token')
const Token = mongoose.model('Token')

const deployFunctions = {
  bridge: deployBridge,
  membersList: deployCommunity,
  transferOwnership: transferOwnership
}

const stepsOrder = ['bridge', 'membersList']

const mandatorySteps = {
  bridge: true
}

const deploy = async (tokenProgress, steps) => {
  const token = await Token.findOne({ address: tokenProgress.tokenAddress })

  if (!token) {
    return stepFailed('tokenIssued', tokenProgress.tokenAddress, 'No such token issued')
  }
  for (let step of stepsOrder) {
    if (steps[step]) {
      if (tokenProgress.steps[step]) {
        console.log(`${step} already deployed`)
      } else {
        try {
          const deployFunction = deployFunctions[step]
          await deployFunction(token, steps[step])
          await stepDone(step, token.address)
        } catch (error) {
          console.log(error)
          return stepFailed(step, tokenProgress.tokenAddress, `step ${step} failed`)
        }
      }
    } else {
      if (mandatorySteps[step] && !tokenProgress.steps[step]) {
        return stepFailed(step, tokenProgress.tokenAddress, `step ${step} should be mandatory`)
      }
    }
  }
}

module.exports = deploy
