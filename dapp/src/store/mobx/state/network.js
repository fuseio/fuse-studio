import { action, observable, computed, flow, makeObservable } from 'mobx'
import Web3 from 'web3'
import { getProviderInfo } from 'web3modal'
import { getWeb3 } from 'services/web3'
import { toNetworkType, getWeb3Options } from 'utils/network'

export default class Network {
  homeNetwork = 'fuse'
  foreignNetwork = 'ropsten'
  walletConnected
  accountAddress
  networkName
  networkId
  providerName
  _provider
  _web3
  _web3Home
  _web3Foreign

  constructor (rootStore) {
    makeObservable(this, {
      _web3: observable.ref,
      web3Context: computed,
      foreignNetwork: observable,
      walletConnected: observable,
      accountAddress: observable,
      networkName: observable,
      networkId: observable,
      clearWallet: action,
      initWeb3: action
    })
    this.rootStore = rootStore
  }

  clearWallet () {
    this.walletConnected = false
    this.accountAddress = ''
    this._provider.close()
  }

  get web3Context () {
    return {
      web3: this._web3,
      accountAddress: this.accountAddress,
      web3Options: getWeb3Options(this.networkName),
      networkType: this.networkName
    }
  }

  initWeb3 = flow(function * (provider) {
    try {
      const web3 = new Web3(provider)
      const accounts = yield web3.eth.getAccounts()
      if (accounts.length) {
        this.walletConnected = true
        this.accountAddress = accounts[0]
      }
      const providerInfo = getProviderInfo(provider)

      this._web3Home = getWeb3({ networkType: this.homeNetwork })
      this._web3Foreign = getWeb3({ networkType: this.foreignNetwork })
      this._web3 = web3
      this._provider = provider
      switch (providerInfo.name) {
        case 'MetaMask':
          this._provider.autoRefreshOnNetworkChange = false
          this._provider.on('chainChanged', async (chainId) => {
            this.networkId = parseInt(chainId)
            this.networkName = toNetworkType(this.networkId)
          })
          break
      }

      this.networkId = yield this._web3.eth.net.getId()
      this.networkName = toNetworkType(this.networkId)
    } catch (error) {
      console.log({ error })
    }
  })
}
