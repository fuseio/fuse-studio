import {action} from './utils'

export const SUBSCRIBE = 'SUBSCRIBE'

export const subscribe = (address, topics) => action(SUBSCRIBE, {address, topics})
