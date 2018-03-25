import * as currencyFactory from 'actions/currencyFactory'

export default (state = {}, action) => {
  switch (action.type) {
    case currencyFactory.SUPPORTS_TOKEN.SUCCESS:
      return {...state, supportsToken: action.data}
    case currencyFactory.TOKENS.SUCCESS:
      return {...state, tokens: action.data}
    default:
      return state
  }
}
