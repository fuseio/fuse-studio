const mongoose = require('mongoose')
const Token = mongoose.model('Token')
const config = require('config')
const { handleReceipt } = require('@handlers/receipts')
const { fetchTokenData } = require('@utils/token')
const CommunityTransferManagerABI = require('@fuse/entities-contracts/abi/CommunityTransferManagerWithEvents')
const CommunityFactoryABI = require('@fuse/entities-contracts/abi/CommunityFactoryWithEvents')

const { roles: { ADMIN_ROLE, APPROVED_ROLE, EMPTY_ROLE } } = require('@fuse/roles')

const deployCommunity = async ({ home, foreign }, communityProgress) => {
  const { createContract, createMethod, send, from } = home
  const { name, isClosed, adminAddress, isCustom, foreignTokenAddress, homeTokenAddress } = communityProgress.steps.community.args
  const method = createMethod(createContract(CommunityFactoryABI, config.get('network.home.addresses.CommunityFactory')), 'createCommunity', name, adminAddress)

  const receipt = await send(method, {
    from
  })

  const communityAddress = receipt.events.CommunityCreated.returnValues.community

  // quick fix to index the EntityAdded event in the correct way
  receipt.to = communityAddress
  await handleReceipt(receipt)

  const transferManagerContract = createContract(CommunityTransferManagerABI, communityAddress)
  const communityMethods = []

  if (isClosed) {
    communityMethods.push(createMethod(transferManagerContract, 'addRule', APPROVED_ROLE, APPROVED_ROLE))
    communityMethods.push(createMethod(transferManagerContract, 'addRule', ADMIN_ROLE, EMPTY_ROLE))
  }

  for (let method of communityMethods) {
    const receipt = await send(method, { from })
    await handleReceipt(receipt)
  }

  if (homeTokenAddress) {
    let token = await Token.findOne({ address: homeTokenAddress })
    if (isCustom && !token) {
      console.log(`Adding the home token ${homeTokenAddress} to the database`)
      const tokenData = await fetchTokenData(homeTokenAddress, {}, home.web3)
      await new Token({ address: homeTokenAddress, networkType: home.networkType, ...tokenData }).save()
    }
  } else if (foreignTokenAddress) {
    let token = await Token.findOne({ address: foreignTokenAddress })
    if (isCustom && !token) {
      console.log(`Adding the custom token ${foreignTokenAddress} to the database`)
      const tokenData = await fetchTokenData(foreignTokenAddress, {}, foreign.web3)
      await new Token({ address: foreignTokenAddress, networkType: foreign.networkType, tokenType: 'custom', ...tokenData }).save()
    }
  }

  return {
    communityAddress,
    isClosed
  }
}

module.exports = {
  deployCommunity
}
