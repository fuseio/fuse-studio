import {action, createRequestTypes} from './index'

export const GET_NETWORK_TYPE = createRequestTypes('GET_NETWORK_TYPE')

export const getNetworkType = () => action(GET_NETWORK_TYPE.REQUEST)
