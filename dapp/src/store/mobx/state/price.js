import { action, observable, flow, makeObservable } from 'mobx'
import request from 'superagent'

const tokenAddress = '0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d'

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
      const tokenPrice = yield request
        .get(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=usd`)
        .then(response => response.body)
      this.fusePrice = tokenPrice[tokenAddress].usd
    } catch (error) {
      console.log('ERROR in fetchFusePrice', { error })
    }
  })
}
