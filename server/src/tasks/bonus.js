const config = require('config')
const { withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const { fetchTokenByCommunity } = require('@utils/graph')
const request = require('request-promise-native')
const lodash = require('lodash')

const bonus = withAccount(async (account, { communityAddress, bonusInfo }, job) => {
  const { web3 } = createNetwork('home', account)
  try {
    console.log(`Requesting token bonus for wallet: ${bonusInfo.receiver} and community: ${communityAddress}`)
    const token = await fetchTokenByCommunity(communityAddress)
    const tokenAddress = web3.utils.toChecksumAddress(token.address)
    const originNetwork = config.get(`network.foreign.name`)
    request.post(`${config.get('funder.urlBase')}bonus/token`, {
      json: true,
      body: { phoneNumber: bonusInfo.phoneNumber, identifier: bonusInfo.identifier, accountAddress: bonusInfo.receiver, tokenAddress, originNetwork, bonusInfo }
    }, (err, response, body) => {
      if (err) {
        console.error(`Error on token bonus for wallet: ${bonusInfo.receiver}`, err)
        job.fail(err)
      } else if (body.error) {
        console.error(`Error on token bonus for wallet: ${bonusInfo.receiver}`, body.error)
        job.fail(body.error)
      } else if (lodash.has(body, 'job._id')) {
        job.attrs.data.funderJobId = body.job._id
      }
      job.save()
    })
  } catch (e) {
    console.error(`Error on token bonus for wallet: ${bonusInfo.receiver}`, e)
  }
})

module.exports = {
  bonus
}
