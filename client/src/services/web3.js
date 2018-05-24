import {init, get} from 'osseus-wallet'
import abi from 'constants/abi'

const config = {
  osseus_wallet: {
    abi,
    ...CONFIG.web3
  }
}

export const onWeb3Ready = init({config})

export default get()
