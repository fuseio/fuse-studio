const mongoose = require('mongoose')
const deployBridge = require('@utils/bridge').deployBridge
const deployMembersList = require('@utils/membersList').deployMembersList
const addError = require('@utils/tokenProgress').addError
const Token = mongoose.model('Token')

const deployFunctions = {
  bridge: deployBridge,
  membersList: deployMembersList
}

const stepsOrder = ['bridge', 'membersList']

const mandatorySteps = {
  bridge: true
}

const deploy = async (tokenProgress, steps) => {
  const token = await Token.findOne({address: tokenProgress.tokenAddress})

  if (!token) {
    return addError('tokenIssued', tokenProgress.tokenAddress, 'No such token issued')
  }
  for (let step of stepsOrder) {
    if (steps[step]) {
      if (tokenProgress.steps[step]) {
        console.log(`${step} already deployed`)
      } else {
        try {
          const deployFunction = deployFunctions[step]
          await deployFunction(token)
        } catch (error) {
          console.log(error)
          return addError(step, tokenProgress.tokenAddress, `step ${step} failed`)
        }
      }
    } else {
      if (mandatorySteps[step] && !tokenProgress.steps[step]) {
        return addError(step, tokenProgress.tokenAddress, `step ${step} should be mandatory`)
      }
    }
  }
}

module.exports = deploy
