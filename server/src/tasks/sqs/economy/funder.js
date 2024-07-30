const config = require('config')
const mongoose = require('mongoose')
const Community = mongoose.model('Community')
const { toWei } = require('web3-utils')

const funder = async ({ home: { send, from } }, communityProgress) => {
  const bonus = config.get('bonus.launch.fuse').toString()
  const { adminAddress } = communityProgress.steps.community.args

  const createdCommunitiesCount = await Community.find({ creatorAddress: adminAddress }).countDocuments()
  if (createdCommunitiesCount > 0) {
    console.log(`User ${adminAddress} already received the fuse bonus`)
    return {
      isSent: false
    }
  }

  try {
    const receipt = await send(null,
      {
        to: adminAddress,
        from,
        value: toWei(bonus)
      }
    )
    if (!receipt.status) {
      console.warn(`error in funding ${adminAddress} with ${bonus} native`)
      console.log({ receipt })
      return {
        isSent: false
      }
    }

    console.log(`succesfully funder ${adminAddress} with ${bonus} native`)
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
