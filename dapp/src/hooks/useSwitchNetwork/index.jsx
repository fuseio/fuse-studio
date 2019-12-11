import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SWITCH_NETWORK } from 'constants/uiConstants'
import { loadModal } from 'actions/ui'
import { changeNetwork } from 'actions/network'
import { getProviderInfo } from 'selectors/accounts'

const useSwitchNetwork = (desiredNetworkType, modalProps) => {
  const dispatch = useDispatch()
  const { networkType } = useSelector(state => state.network)
  const providerInfo = useSelector(state => getProviderInfo(state))
  const desiredNetworkTypeArray = Array.isArray(desiredNetworkType) ? desiredNetworkType : [desiredNetworkType]
  useEffect(() => {
    if (!desiredNetworkTypeArray.includes(networkType)) {
      if (providerInfo.type === 'web') {
        dispatch(changeNetwork(desiredNetworkTypeArray[0]))
      } else {
        dispatch(loadModal(SWITCH_NETWORK, { desiredNetworkType, networkType, ...modalProps }))
      }
    }
    return () => {}
  }, [networkType])
  return null
}

export default useSwitchNetwork
