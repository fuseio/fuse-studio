import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SWITCH_NETWORK } from 'constants/uiConstants'
import { loadModal } from 'actions/ui'
import { changeNetwork } from 'actions/network'

const useSwitchNetwork = (desiredNetworkType, modalProps) => {
  const dispatch = useDispatch()
  const { networkType, isPortis } = useSelector(state => state.network)
  const desiredNetworkTypeArray = Array.isArray(desiredNetworkType) ? desiredNetworkType : [desiredNetworkType]
  useEffect(() => {
    if (!desiredNetworkTypeArray.includes(networkType)) {
      if (isPortis) {
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
