import { fromPrivateKey, generate } from 'ethereumjs-wallet'
import WalletSubprovider from 'ethereumjs-wallet/provider-engine'
import ZeroClientProvider from 'web3-provider-engine/zero'
import { isValidPrivate, toBuffer } from 'ethereumjs-util'

// const pk = generate()._privKey
// console.log(isValidPrivate(pk))

// const wallet = fromPrivateKey(pk)
// const wallerProvider = new WalletSubprovider(wallet)
// const provider = new ZeroClientProvider({
//   rpcUrl: CONFIG.web3.fuseProvider,
//   ...wallerProvider
// })

export const getProvider = (opts = {}) => {
  const pk = opts.pk ? toBuffer(opts.pk) : generate()._privKey

  const wallet = fromPrivateKey(pk)
  const walletProvider = new WalletSubprovider(wallet)
  const provider = new ZeroClientProvider({
    rpcUrl: CONFIG.web3.fuseProvider,
    ...walletProvider
  })

  if (!window.ethereum) {
    window.ethereum = provider
    window.ethereum.enable = () =>
      new Promise((resolve, reject) => {
        provider.sendAsync({ method: 'eth_accounts' }, (error, response) => {
          if (error) {
            reject(error)
          } else {
            resolve(response.result)
          }
        })
      })
  }
  return provider
}
