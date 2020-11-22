const config = require('config')
const { createNetwork, signMultiSig } = require('@utils/web3')
const WalletFactoryABI = require('@constants/abi/WalletFactory')
const MultiSigWalletABI = require('@constants/abi/MultiSigWallet')
const { toWei } = require('web3-utils')

const addManager = async (mutisigOwnerAccount, { managerAccountAddress }, job) => {
  const { createContract, createMethod, send, web3 } = createNetwork('home', mutisigOwnerAccount)

  const walletFactory = createContract(WalletFactoryABI, config.get('network.home.addresses.WalletFactory'))
  const addManagerMethod = createMethod(walletFactory, 'addManager', managerAccountAddress)
  const addManagerMethodData = addManagerMethod.encodeABI()

  const multiSigWallet = createContract(MultiSigWalletABI, config.get('network.home.addresses.MultiSigWallet'))
  const signature = await signMultiSig(web3, mutisigOwnerAccount, multiSigWallet, walletFactory.address, addManagerMethodData)

  const method = createMethod(multiSigWallet, 'execute', walletFactory.address, 0, addManagerMethodData, signature)
  const receipt = await send(method, {
    from: mutisigOwnerAccount.address
  }, {
    transactionHash: (hash) => {
      console.log(`transaction ${hash} is created by ${mutisigOwnerAccount.address}`)
      job.set('data.txHash', hash)
      job.save()
    }
  })

  const initialBalance = config.get('accounts.wallet.initialBalance')

  await send(null,
    {
      to: managerAccountAddress,
      from: mutisigOwnerAccount.address,
      value: toWei(initialBalance),
      gas: config.get('gasLimitForTx.funder')
    },
    {
      transactionHash: hash => {
        console.log(`transaction ${hash} is created by ${mutisigOwnerAccount.address}`)
        job.set('data.txHash', hash)
        job.save()
      }
    }
  )

  return receipt
}

module.exports = {
  addManager
}
