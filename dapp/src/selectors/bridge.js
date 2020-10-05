import capitalize from 'lodash/capitalize'
import { getForeignNetwork } from 'selectors/network'
import { toShortName } from 'utils/network'

export const getBridgeMediator = (state, bridgeType = 'foreign', options = {}) => {
  if (bridgeType) {
    const foreignNetwork = options && options.networkType ? toShortName(options.networkType) : getForeignNetwork(state)
    return bridgeType === 'foreign'
      ? CONFIG.web3.addresses[`${foreignNetwork}`].MultiBridgeMediator
      : CONFIG.web3.addresses.fuse[`MultiBridgeMediator${capitalize(foreignNetwork)}`]
  }
}
