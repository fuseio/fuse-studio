import {init, get} from 'osseus-wallet'
import abi from 'constants/abi'
const Web3 = require('web3')

const config = {
  osseus_wallet: {
    abi,
    ...CONFIG.web3
  }
}

export const websocketProvider = new Web3.providers.WebsocketProvider('ws://localhost:8546')
export const web3Socket = new Web3(websocketProvider)

export const onWeb3Ready = init({config})

export default get()
