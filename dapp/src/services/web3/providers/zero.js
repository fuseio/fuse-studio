import { fromPrivateKey, generate } from 'ethereumjs-wallet'
import WalletSubprovider from 'ethereumjs-wallet/provider-engine'
import ZeroClientProvider from 'web3-provider-engine/zero'
import { toBuffer } from 'ethereumjs-util'

export const getProvider = (opts = {}) => {
  const wallet = opts.pk ? fromPrivateKey(toBuffer(opts.pk)) : generate()
  const walletProvider = new WalletSubprovider(wallet)

  const providerEngine = new ZeroClientProvider({
    rpcUrl: CONFIG.web3.fuseProvider,
    ...walletProvider,
    engineParams: {
      useSkipCache: false
    }
  })

  // TODO: The 3rd provider (BlockTracker) causing trouble. Find why.
  providerEngine.removeProvider(providerEngine._providers[3])
  if (!window.ethereum) {
    window.ethereum = providerEngine
    window.ethereum.enable = () =>
      new Promise((resolve, reject) => {
        providerEngine.sendAsync({ method: 'eth_accounts', params: [] }, (error, response) => {
          if (error) {
            reject(error)
          } else {
            resolve(response.result)
          }
        })
      })
  }
  return providerEngine
}
