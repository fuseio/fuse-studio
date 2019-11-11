const config = require('config')
const { createNetwork } = require('@utils/web3')
const WalletFactoryABI = require('@constants/abi/WalletFactory')
const homeAddresses = config.get('network.home.addresses')
const { withAccount } = require('@utils/account')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')

const createWallet = withAccount(async (account, { owner, ens = '' }) => {
  const { createContract, createMethod, send } = createNetwork('home', account)
  const walletFactory = createContract(WalletFactoryABI, homeAddresses.WalletFactory)
  const method = createMethod(walletFactory, 'createWallet', owner, Object.values(homeAddresses.walletModules), ens)

  const receipt = await send(method, {
    from: account.address
  })
  const walletAddress = receipt.events.WalletCreated.returnValues._wallet
  console.log(`Created wallet contract ${receipt.events.WalletCreated.returnValues._wallet} for account ${owner}`)

  await UserWallet.findOneAndUpdate({ accountAddress: owner }, { walletAddress })
  return receipt
})

module.exports = {
  createWallet
}
