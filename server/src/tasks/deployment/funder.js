const request = require('request-promise-native')
const config = require('config')

const funder = async (networks, communityProgress) => {
  const { adminAddress: accountAddress } = communityProgress.steps.community.args
  const { foreignTokenAddress: tokenAddress } = communityProgress.steps.bridge.args
  const options = {
    method: 'POST',
    uri: `${config.get('funder.urlBase')}fund/native`,
    body: { accountAddress, tokenAddress },
    json: true
  }

  try {
    await request(options)
  } catch (error) {
    console.log('funder step error', { error })
  }
}

module.exports = {
  funder
}
