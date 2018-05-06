import {init, get} from 'osseus-wallet'
import addresses from 'constants/addresses'
import abi from 'constants/abi'
import config from 'config'

const osseusConfig = {
  osseus_wallet: {
    addresses,
    abi,
    ...config.web3
  }
}

export const onWeb3Ready = init({config: osseusConfig})

export default get()
