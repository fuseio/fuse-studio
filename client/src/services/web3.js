import {init, get} from 'osseus-wallet'
import addresses from 'constants/addresses'
import abi from 'constants/abi'

const config = {
  osseus_wallet: {
    addresses,
    abi,
    ...CONFIG.web3
  }
}

export const onWeb3Ready = init({config})

export default get()
