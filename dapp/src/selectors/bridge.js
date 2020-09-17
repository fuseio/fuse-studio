import capitalize from 'lodash/capitalize'
import { getForeignNetwork } from 'selectors/network'

export const getBridgeMediator = (state, bridgeType = 'foreign') => {
  if (bridgeType) {
    const foreignNetwork = getForeignNetwork(state)
    return bridgeType === 'foreign'
      ? CONFIG.web3.addresses[`${foreignNetwork}`].MultiBridgeMediator
      : CONFIG.web3.addresses.fuse[`MultiBridgeMediator${capitalize(foreignNetwork)}`]
  }
}
