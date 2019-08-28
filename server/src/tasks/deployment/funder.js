const request = require('request-promise-native')
const config = require('config')

const funder = async ({ home: { createContract, createMethod, send, from } }, communityProgress) => {
  const { adminAddress } = communityProgress.steps.community.args

  try {
    await request.post(config.get('funder.urlBase') + 'balance/request/' + adminAddress)
  } catch (error) {
    console.log('funder step error', { error })
  }
}

module.exports = {
  funder
}
