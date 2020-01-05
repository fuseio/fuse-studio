import { postponeAction } from 'actions/accounts'
import { getAccountAddress } from 'selectors/accounts'

export const postponeMiddleware = store => next => action => {
  if (action.options && action.options.desiredNetworkType) {
    const state = store.getState()
    const accountAddress = getAccountAddress(state)
    const { networkType } = state.network
    if (action.options.desiredNetworkType !== networkType) {
      return next(postponeAction(accountAddress, action))
    }
  }
  return next(action)
}
