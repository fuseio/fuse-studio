import {PREDICT_CLN_PRICES} from 'actions/marketMaker'

const initialState = {
  prices: [],
  tokenAddress: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    case PREDICT_CLN_PRICES.SUCCESS:
      return {...state, prices: action.response.prices, tokenAddress: action.tokenAddress}
    case PREDICT_CLN_PRICES.REQUEST:
      return {...state, ...initialState}
    default:
      return state
  }
}
