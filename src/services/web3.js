import {init, get} from 'osseus-wallet'
import addresses from 'constants/addresses'
import abi from 'constants/abi'

const config = {
  osseus_wallet: {
    addresses,
    abi,
    fallbackProvider: 'https://ropsten.infura.io/CdAtL4kE55uikRNN1pON'
  }
}

init({config})

export default get()
