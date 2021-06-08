const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')

const validateFundingLimitPerUser = async ({ job, phoneNumber, tokenAddress, communityAddress, receiverAddress, bonusType, bonusMaxTimesLimit }) => {
  const fundingsCountForPhoneNumber = await QueueJob.find({
    name: 'fundToken',
    status: { $ne: 'failed' },
    ...(job && { _id: { $ne: job._id } }),
    'data.phoneNumber': phoneNumber,
    'data.tokenAddress': tokenAddress,
    'data.communityAddress': communityAddress,
    'data.receiverAddress': receiverAddress,
    'data.bonusType': bonusType
  }).countDocuments()

  if (fundingsCountForPhoneNumber >= bonusMaxTimesLimit) {
    return false
  }
  return true
}

module.exports = {
  validateFundingLimitPerUser
}
