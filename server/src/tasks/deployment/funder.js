const config = require('config')
const mongoose = require('mongoose')
const Community = mongoose.model('Community')
const Account = mongoose.model('Account')
const { toWei } = require('web3-utils')

const funder = async ({ home: { web3, from } }, communityProgress) => {
  const bonus = config.get('bonus.launch.fuse').toString()
  const { adminAddress } = communityProgress.steps.community.args

  const createdCommunitiesCount = await Community.find({ creatorAddress: adminAddress }).countDocuments()
  if (createdCommunitiesCount > 0) {
    console.log(`User ${adminAddress} already received the fuse bonus`)
    return {
      isSent: false
    }
  }

  const account = await Account.findOne({ address: from })
  try {
    const receipt = await web3.eth.sendTransaction({
      to: adminAddress,
      from,
      value: toWei(bonus),
      nonce: account.nonce,
      gasPrice: config.get('network.home.gasPrice'),
      gas: config.get('gasLimitForTx.funder')
    })
    if (receipt) {
      account.nonces['home']++
      await account.save()
    }

    return {
      isSent: true,
      bonus
    }
  } catch (e) {
    console.error(e)
    return {
      isSent: false
    }
  }
}

module.exports = {
  funder
}
