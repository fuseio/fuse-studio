import React, {Component} from 'react'
import Web3 from 'web3'
import CurrencyFactoryAbi from 'constants/abi/CurrencyFactory'

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8546')
console.log(CurrencyFactoryAbi)
console.log(web3)

class Communities extends Component {
  render () {
    return (<div>
      Communities
    </div>)
  }
}

export default Communities
