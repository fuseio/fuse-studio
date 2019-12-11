import Web3Connect from 'web3connect'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Portis from '@portis/web3'
// import Fortmatic from 'fortmatic'
// import Authereum from "authereum"
// import Torus from '@toruslabs/torus-embed'
const useDefaultWallet = async (defaultWallet, network) => {
  let normalizedWallet
  if (defaultWallet) {
    normalizedWallet = defaultWallet.toLowerCase()
  }
  let provider
  switch (normalizedWallet) {
    case 'metamask':
      provider = await Web3Connect.ConnectToInjected()
      break

    case 'dapper':
      provider = await Web3Connect.ConnectToInjected()
      break

      // case 'fortmatic':
      //   provider = await Web3Connect.ConnectToFortmatic(Fortmatic, {
      //     key: CONFIG.web3.fortmatic.id,
      //     network
      //   })
      //   break

    case 'portis':
      provider = await Web3Connect.ConnectToPortis(Portis, {
        id: CONFIG.web3.portis.id,
        network
      })
      break

    case 'walletconnect':
      provider = await Web3Connect.ConnectToWalletConnect(WalletConnectProvider, {
        infuraId: CONFIG.web3.apiKey
      })
      break

      // case 'authereum':
      //   provider = await Web3Connect.ConnectToAuthereum(Authereum, {
      //     network: 'mainnet', // optional
      //   })
      //   break

      // case 'torus':
      //   provider = await Web3Connect.ConnectToTorus(Torus, {
      //     enableLogging: false, // optional
      //     buttonPosition: 'bottom-left', // optional
      //     buildEnv: 'production', // optional
      //     showTorusButton: true, // optional
      //   })
      //   break

    default:
      provider = await Web3Connect.ConnectToInjected()
      break
  }

  return provider
}

export default useDefaultWallet
