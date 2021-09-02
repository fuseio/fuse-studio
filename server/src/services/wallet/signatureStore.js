const { SignatureStore } = require('@utils/abi')
const TransferManagerABI = require('@constants/abi/TransferManager')
const CommunityManagerABI = require('@constants/abi/CommunityManager')
const IUniswapV2Router02ABI = require('@constants/abi/IUniswapV2Router02')
const MultiRewardProgramABI = require('@constants/abi/MultiRewardProgram')
const SingleRewardProgramABI = require('@constants/abi/SingleRewardProgram')

const signatureStore = new SignatureStore()
signatureStore.addContract('TransferManager', TransferManagerABI)
signatureStore.addContract('CommunityManager', CommunityManagerABI)
signatureStore.addContract('FuseswapRouter', IUniswapV2Router02ABI)
signatureStore.addContract('MultiRewardProgram', MultiRewardProgramABI)
signatureStore.addContract('SingleRewardProgram', SingleRewardProgramABI)

module.exports = signatureStore
