import { action, createRequestTypes } from './utils'

export const SUBSCRIBE_TO_TRANSFER = createRequestTypes('SUBSCRIBE_TO_TRANSFER')
export const SUBSCRIBE_TO_CHANGE = createRequestTypes('SUBSCRIBE_TO_CHANGE')

export const subscribeToTransfer = (tokenAddress, accountAddress) => action(SUBSCRIBE_TO_TRANSFER.REQUEST, {
  tokenAddress,
  accountAddress
})

export const subscribeToChange = (tokenAddress, marketMakerAddress) => action(SUBSCRIBE_TO_CHANGE.REQUEST, {
  tokenAddress,
  marketMakerAddress
})
