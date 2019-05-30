const mongoose = require('mongoose')
const Entity = mongoose.model('Entity')
const Community = mongoose.model('Community')
const { hasRole, roles: { APPROVED_ROLE } } = require('@fuse/roles')
const { deriveFromRoles } = require('@utils/roles')
const { web3 } = require('@services/web3/home')

const handleTransferManagerSet = async (event) => {
  const token = event.address
  const communityAddress = event.returnValues.transferManager
  console.log({ token, communityAddress })
}

const handleEntityAdded = async (event, receipt) => {
  const communityAddress = web3.utils.toChecksumAddress(receipt.to)
  const { roles, account } = event.returnValues
  const derivedFields = deriveFromRoles(roles)

  return Entity.findOneAndUpdate({ account, communityAddress }, { ...derivedFields, communityAddress, roles, account }, { new: true, upsert: true })
}

const handleEntityRemoved = async (event, receipt) => {
  const communityAddress = web3.utils.toChecksumAddress(receipt.to)
  const { account } = event.returnValues

  return Entity.deleteOne({ account, communityAddress })
}

const handleEntityRolesUpdated = async (event, receipt) => {
  const communityAddress = web3.utils.toChecksumAddress(receipt.to)
  const { roles, account } = event.returnValues
  const derivedFields = deriveFromRoles(roles)

  return Entity.updateOne({ account, communityAddress }, { ...derivedFields, roles })
}

const handleRuleAdded = async (event) => {
  const communityAddress = event.address
  const { fromMask, toMask } = event.returnValues
  if (hasRole(fromMask, APPROVED_ROLE) && hasRole(toMask, APPROVED_ROLE)) {
    return Community.updateOne({ communityAddress }, { isClosed: true })
  }
}

const handleRuleRemoved = async (event) => {
  const communityAddress = event.address
  const { fromMask, toMask } = event.returnValues
  if (hasRole(fromMask, APPROVED_ROLE) && hasRole(toMask, APPROVED_ROLE)) {
    return Community.updateOne({ communityAddress }, { isClosed: false })
  }
}

module.exports = {
  handleTransferManagerSet,
  handleEntityAdded,
  handleEntityRemoved,
  handleEntityRolesUpdated,
  handleRuleAdded,
  handleRuleRemoved
}
