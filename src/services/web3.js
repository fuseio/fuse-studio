import {init, get} from 'osseus-wallet'
import addresses from 'constants/addresses'
import abi from 'constants/abi'

const config = {
    addresses,
    abi
}

init(config)

export default get()
