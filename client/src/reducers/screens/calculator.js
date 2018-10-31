import {PREDICT_CLN_PRICES} from 'actions/marketMaker'

const initialState = {
  prices: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case PREDICT_CLN_PRICES.SUCCESS:
      return {...state, prices: action.response.prices}
    default:
      return state
  }
}
