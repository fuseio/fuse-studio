const { Signatures } = require('@utils/abi')
const TransferManagerABI = require('@constants/abi/TransferManager')
const CommunityManagerABI = require('@constants/abi/CommunityManager')

const signatures = new Signatures()
signatures.addContract('TransferManager', TransferManagerABI)
signatures.addContract('CommunityManager', CommunityManagerABI)

module.exports = {
  signatures
}
