import { action, observable, flow } from 'mobx'
import Web3 from 'web3'
import { getProviderInfo } from 'web3modal'

export default class Network {
  homeNetwork = 'fuse'
  @observable foreignNetwork = 'main'
  @observable networkType = 'main'
  @observable walletConnected
  @observable networkId
  @observable accountAddress
  providerName
  _provider
  _web3

  constructor (rootStore) {
    this.rootStore = rootStore
  }

  @action
  clearWallet () {
    this.walletConnected = false
    this.accountAddress = ''
    this._provider.close()
  }

  initWeb3 = flow(function * (provider) {
    try {
      const web3 = new Web3(provider)
      const accounts = yield web3.eth.getAccounts()
      if (accounts.length) {
        this.walletConnected = true
        this.accountAddress = accounts[0]
        console.log({ accountAddress: this.accountAddress })
      }
      const providerInfo = getProviderInfo(provider)

      this._web3 = web3
      this._provider = provider
      switch (providerInfo.name) {
        case 'MetaMask':
          this._provider.autoRefreshOnNetworkChange = false
          this._provider.on('chainChanged', async () => {
            this.networkId = await web3.eth.net.getId()
          })
          break
      }

      this.networkId = yield this._web3.eth.net.getId()
    } catch (error) {
      console.log({ error })
    }
  })
}
