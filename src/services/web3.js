import {init, get} from 'osseus-wallet'
import addresses from 'constants/addresses'
import abi from 'constants/abi'

const config = {
  osseus_wallet: {
    addresses,
    abi,
    // account: '0x22D481f977abfB7471d1b1b65465754074A7db5c',
    // password: 'pass123',
    // provider: 'http://127.0.0.1:8545'
    provider: 'https://ropsten.infura.io/CdAtL4kE55uikRNN1pON'
  }
}

export const onWeb3Ready = init({config})

export default get()
