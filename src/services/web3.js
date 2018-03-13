import Web3 from 'web3'
import CLNAbi from 'constants/abi/ColuLocalNetwork'
import CurrencyFactoryAbi from 'constants/abi/CurrencyFactory'
import ColuLocalNetworkSaleAbi from 'constants/abi/ColuLocalNetworkSale'

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8546')

const CLNContract = new web3.eth.Contract(CLNAbi, '0x41C9d91E96b933b74ae21bCBb617369CBE022530')
const currencyFactoryContract = new web3.eth.Contract(CurrencyFactoryAbi, '0x7B2cbEC58653aAf79842b80Ed184B2EcB4E17d59')
const coluLocalNetworkSale = new web3.eth.Contract(ColuLocalNetworkSaleAbi, '0xa973fa1cF412AC6A76C749aA6E1fcA7251814A48')

export const data = {}

web3.eth.net.getId().then(netId => {
  switch (netId) {
    case 1:
      data.network = 'mainnet'
      break
    case 2:
      data.network = 'morden'
      break
    case 3:
      data.network = 'ropsten'
      break
    default:
      data.network = 'unknown'
  }
})

web3.eth.getAccounts().then((accounts) => {
  web3.eth.defaultAccount = accounts[0]
})

// debugger
CLNContract.methods.name().call().then((name) => {
  console.log(name)
  data.name = name
})

currencyFactoryContract.methods.supportsToken('0x41C9d91E96b933b74ae21bCBb617369CBE022530').call().then((result) => {
  console.log(result)
  data.supportsToken = result
})


// coluLocalNetworkSale.

export default web3
