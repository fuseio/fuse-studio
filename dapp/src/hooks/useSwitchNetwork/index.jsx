import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SWITCH_NETWORK } from 'constants/uiConstants'
import { loadModal } from 'actions/ui'
import { changeNetwork } from 'actions/network'

const useSwitchNetwork = (tmp, pluginName) => {
  const dispatch = useDispatch()
  const { networkType, isPortis } = useSelector(state => state.network)

  useEffect(() => {
    if (networkType !== 'fuse') {
      if (isPortis) {
        dispatch(changeNetwork('fuse'))
      } else {
        dispatch(loadModal(SWITCH_NETWORK, { pluginName }))
      }
    }
    return () => {}
  }, [networkType])
  return null
}

export default useSwitchNetwork
