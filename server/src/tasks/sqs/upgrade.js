const config = require('config')
const { merge, omit } = require('lodash')
const { createNetwork } = require('@utils/web3')
const mongoose = require('mongoose')
const { sendRelay, isAllowedToRelay } = require('@utils/relay')
const UserWallet = mongoose.model('UserWallet')
const WalletUpgrade = mongoose.model('WalletUpgrade')

const installUpgrade = async (account, { walletAddress, methodName, methodData, nonce, gasPrice, gasLimit, signature, walletModule, network, upgradeId }, job) => {
  const networkType = network === config.get('network.foreign.name') ? 'foreign' : 'home'
  const { web3 } = createNetwork(networkType, account)
  const walletModuleABI = require(`@constants/abi/${walletModule}`)
  const allowedToRelay = isAllowedToRelay(web3, walletModule, walletModuleABI, methodName, methodData, networkType)
  if (allowedToRelay) {
    const wallet = await UserWallet.findOne({ walletAddress })
    const walletModuleAddress = wallet.walletModules[walletModule]
    const { relayingSuccess } = await sendRelay(account, { network, walletModule, walletModuleAddress, walletAddress, methodData, nonce, signature, gasPrice, gasLimit }, job)
    if (relayingSuccess) {
      const upgrade = await WalletUpgrade.findById(upgradeId)
      wallet.upgradesInstalled.push(upgradeId)
      wallet.version = upgrade.version
      wallet.paddedVersion = upgrade.paddedVersion
      wallet.walletModules = merge(omit(wallet.walletModules, Object.keys(upgrade.disabledModules)), upgrade.enabledModules)
      return wallet.save()
    }
  }
}

module.exports = {
  installUpgrade
}
