import { createRequestTypes, createTransactionRequestTypes, requestAction } from './utils'

export const entityName = 'bridges'


export const CLEAR_RELAY_EVENT = createRequestTypes('CLEAR_RELAY_EVENT')
export const TRANSFER_TO_HOME = createTransactionRequestTypes('TRANSFER_TO_HOME')
export const TRANSFER_TO_FOREIGN = createTransactionRequestTypes('TRANSFER_TO_FOREIGN')

export const WATCH_FOREIGN_BRIDGE = createTransactionRequestTypes('WATCH_FOREIGN_BRIDGE')
export const WATCH_HOME_BRIDGE = createTransactionRequestTypes('WATCH_HOME_BRIDGE')
export const APPROVE_TOKEN = createTransactionRequestTypes('APPROVE_TOKEN')
export const GET_TOKEN_ALLOWANCE = createRequestTypes('GET_TOKEN_ALLOWANCE')
export const FETCH_HOME_TOKEN_ADDRESS = createRequestTypes('FETCH_HOME_TOKEN_ADDRESS')

export const clearRelayEvent = () => requestAction(CLEAR_RELAY_EVENT)
export const transferToHome = (foreignTokenAddress, value) => requestAction(TRANSFER_TO_HOME, { foreignTokenAddress, value, confirmationsLimit: CONFIG.web3.bridge.confirmations.foreign })
export const transferToForeign = (homeTokenAddress, value) => requestAction(TRANSFER_TO_FOREIGN, { homeTokenAddress, value, confirmationsLimit: CONFIG.web3.bridge.confirmations.home })
export const approveToken = (tokenAddress, value, bridgeType) => requestAction(APPROVE_TOKEN, { tokenAddress, value, bridgeType })
export const getTokenAllowance = (tokenAddress, bridgeType) => requestAction(GET_TOKEN_ALLOWANCE, { tokenAddress, bridgeType })
export const fetchHomeTokenAddress = (communityAddress, foreignTokenAddress) => requestAction(FETCH_HOME_TOKEN_ADDRESS, { communityAddress, foreignTokenAddress })

export const watchForeignBridge = (foreignBridgeAddress, transactionHash) => requestAction(WATCH_FOREIGN_BRIDGE, { foreignBridgeAddress, transactionHash })
export const watchHomeBridge = (homeBridgeAddress, transactionHash) => requestAction(WATCH_HOME_BRIDGE, { homeBridgeAddress, transactionHash })
