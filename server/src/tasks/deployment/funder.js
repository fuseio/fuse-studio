const request = require('request-promise-native')

const funder = async ({ home: { createContract, createMethod, send, from } }, communityProgress) => {
  const { adminAddress } = communityProgress.steps.community.args

  try {
    await request.post('https://funder-qa.fusenet.io/api/balance/request/' + adminAddress)
  } catch (error) {
    console.log('funder step error', { error })
  }
}

module.exports = {
  funder
}
