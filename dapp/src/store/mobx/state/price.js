import { action, observable, flow, makeObservable } from 'mobx'
import request from 'superagent'

export default class Price {
  fusePrice = 0

  constructor (rootStore) {
    makeObservable(this, {
      fusePrice: observable,
      fetchFusePrice: action
    })
    this.rootStore = rootStore
  }

  fetchFusePrice = flow(function * () {
    try {
      const tokenAddress = CONFIG.web3.addresses.main.FuseToken
      const tokenPrice = yield request
        .get(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=usd`)
        .then(response => response.body)
      this.fusePrice = tokenPrice[tokenAddress.toLowerCase()].usd
    } catch (error) {
      console.log('ERROR in fetchFusePrice', { error })
    }
  })
}
