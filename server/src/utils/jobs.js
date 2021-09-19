const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')

const validateBonusAlowance = async ({ job, phoneNumber, tokenAddress, communityAddress, bonusType, bonusMaxTimesLimit }) => {
  if (bonusType === 'referral') {
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

  if (fundingsCountForPhoneNumber >= bonusMaxTimesLimit) {
    return false
  }
  return true
}

module.exports = {
  validateBonusAlowance
}
