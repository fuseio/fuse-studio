import Web3 from 'web3'

const createWeb3 = (fallbackProvider) => {
  const web3 = new Web3(Web3.givenProvider || fallbackProvider)

  web3.eth.getAccounts().then((accounts) => {
    web3.eth.defaultAccount = accounts[0]
  })

  return web3
}

const web3 = createWeb3('ws://localhost:8546')

export default web3
