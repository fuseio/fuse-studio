import { createRequestTypes, createTransactionRequestTypes, requestAction, action } from './utils'

export const entityName = 'bridges'

export const CLEAR_RELAY_EVENT = createRequestTypes('CLEAR_RELAY_EVENT')
export const TRANSFER_TO_HOME = createTransactionRequestTypes('TRANSFER_TO_HOME')
export const TRANSFER_TO_FOREIGN = createTransactionRequestTypes('TRANSFER_TO_FOREIGN')

export const TOGGLE_MULTI_BRIDGE = 'TOGGLE_MULTI_BRIDGE'
export const WATCH_NEW_TOKEN_REGISTERED = createRequestTypes('WATCH_NEW_TOKEN_REGISTERED')
export const WATCH_FOREIGN_BRIDGE = createTransactionRequestTypes('WATCH_FOREIGN_BRIDGE')
export const WATCH_HOME_BRIDGE = createTransactionRequestTypes('WATCH_HOME_BRIDGE')
export const APPROVE_TOKEN = createTransactionRequestTypes('APPROVE_TOKEN')
export const GET_TOKEN_ALLOWANCE = createRequestTypes('GET_TOKEN_ALLOWANCE')
export const FETCH_HOME_TOKEN_ADDRESS = createRequestTypes('FETCH_HOME_TOKEN_ADDRESS')

export const clearRelayEvent = () => requestAction(CLEAR_RELAY_EVENT)
export const toggleMultiBridge = (isMultiBridge) => action(TOGGLE_MULTI_BRIDGE, { isMultiBridge })
export const watchHomeNewTokenRegistered = () => requestAction(WATCH_NEW_TOKEN_REGISTERED)
export const transferToHome = (foreignTokenAddress, value, foreignBridgeAddress, multiBridge) => requestAction(TRANSFER_TO_HOME, { foreignTokenAddress, value, confirmationsLimit: CONFIG.web3.bridge.confirmations.foreign, foreignBridgeAddress, multiBridge })
export const transferToForeign = (homeTokenAddress, value, homeBridgeAddress, multiBridge) => requestAction(TRANSFER_TO_FOREIGN, { homeTokenAddress, value, confirmationsLimit: CONFIG.web3.bridge.confirmations.home, homeBridgeAddress, multiBridge })
export const approveToken = (tokenAddress, value, bridgeType) => requestAction(APPROVE_TOKEN, { tokenAddress, value, bridgeType })
export const getTokenAllowance = (tokenAddress, bridgeType) => requestAction(GET_TOKEN_ALLOWANCE, { tokenAddress, bridgeType })
export const fetchHomeTokenAddress = (communityAddress, foreignTokenAddress, options = {}) => requestAction(FETCH_HOME_TOKEN_ADDRESS, { communityAddress, foreignTokenAddress, options })

export const watchForeignBridge = (transactionHash, foreignBridgeAddress, multiBridge) => requestAction(WATCH_FOREIGN_BRIDGE, { transactionHash, foreignBridgeAddress, multiBridge })
export const watchHomeBridge = (transactionHash, homeBridgeAddress, multiBridge) => requestAction(WATCH_HOME_BRIDGE, { transactionHash, homeBridgeAddress, multiBridge })
