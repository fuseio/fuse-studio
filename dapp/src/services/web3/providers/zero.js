import { fromPrivateKey, generate } from 'ethereumjs-wallet'
import WalletSubprovider from 'ethereumjs-wallet/provider-engine'
import ZeroClientProvider from 'web3-provider-engine/zero'
import { toBuffer } from 'ethereumjs-util'

export const getProvider = (opts = {}) => {
  const wallet = opts.pk ? fromPrivateKey(toBuffer(opts.pk)) : generate()
  const walletProvider = new WalletSubprovider(wallet)
  const provider = new ZeroClientProvider({
    rpcUrl: CONFIG.web3.fuseProvider,
    ...walletProvider,
    engineParams: {
      useSkipCache: false
    }
  })

  if (!window.ethereum) {
    window.ethereum = provider
    window.ethereum.enable = () =>
      new Promise((resolve, reject) => {
        provider.sendAsync({ method: 'eth_accounts', params: [] }, (error, response) => {
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
