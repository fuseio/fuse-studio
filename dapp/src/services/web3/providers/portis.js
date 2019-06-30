import Portis from '@portis/web3'
import { toLongName } from 'utils/network'
import { loadState } from 'utils/storage'

export let portis

export const getProvider = () => {
  const networkState = loadState('state.network') || CONFIG.web3.bridge.network
  const { foreignNetwork } = networkState

  portis = new Portis(CONFIG.web3.portis.id, toLongName(foreignNetwork))
  return portis.provider
}
