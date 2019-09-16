import React from 'react'
import { useDispatch } from 'react-redux'
import { SWITCH_NETWORK } from 'constants/uiConstants'
import { SHOW_MODAL } from 'actions/ui'

const useSwitchNetwork = (networkType, pluginName) => {
  const dispatch = useDispatch()
  React.useEffect(() => {
    if (networkType !== 'fuse') {
      dispatch({ type: SHOW_MODAL, modalType: SWITCH_NETWORK, modalProps: { pluginName } })
    }
    return () => {}
  }, [networkType])
  return null
}

export default useSwitchNetwork
