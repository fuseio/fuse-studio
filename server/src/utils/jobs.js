const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')

const validateBonusAlowance = async ({ job, phoneNumber, tokenAddress, communityAddress, receiverAddress, bonusType, bonusMaxTimesLimit }) => {
  if (bonusType === 'referral' || bonusType === 'topup') {
    console.log(`User wallet ${receiverAddress} is allowed for a ${bonusType} bonus`)
    return true
  }
  const fundingsCountForPhoneNumber = await QueueJob.find({
    name: 'fundToken',
    status: { $ne: 'failed' },
    ...(job && { _id: { $ne: job._id } }),
    'data.phoneNumber': phoneNumber,
    'data.tokenAddress': tokenAddress,
    'data.communityAddress': communityAddress,
    'data.bonusType': bonusType
  }).countDocuments()

  console.log(`User wallet ${receiverAddress} received ${fundingsCountForPhoneNumber} bonuses on his phone number ${phoneNumber} on type ${bonusType}. maximum is ${bonusMaxTimesLimit}`)
  if (fundingsCountForPhoneNumber >= bonusMaxTimesLimit) {
    console.log(`User wallet ${receiverAddress} is not allowed for a ${bonusType} bonus`)
    return false
  }
  console.log(`User wallet ${receiverAddress} is allowed for a ${bonusType} bonus`)
  return true
}

module.exports = {
  validateBonusAlowance
}
