import { FETCH_TOKEN_PROGRESS, FETCH_TOKEN_TOTAL_SUPPLY, FETCH_COMMUNITY_DATA } from 'actions/token'
import { IS_USER_EXISTS } from 'actions/user'
import { FETCH_HOME_TOKEN_ADDRESS, TOGGLE_MULTI_BRIDGE } from 'actions/bridge'
import pick from 'lodash/pick'

export default (state = {}, action) => {
  switch (action.type) {
    case TOGGLE_MULTI_BRIDGE:
      return { ...state, isMultiBridge: action.isMultiBridge }
    case FETCH_COMMUNITY_DATA.SUCCESS:
      return { ...state, communityAddress: action.communityAddress }
    case FETCH_COMMUNITY_DATA.REQUEST:
      return { communityAddress: action.communityAddress }
    case FETCH_TOKEN_TOTAL_SUPPLY.SUCCESS:
      return { ...state, totalSupply: { ...state.totalSupply, [action.tokenAddress]: action.response.totalSupply } }
    case FETCH_TOKEN_PROGRESS.SUCCESS:
      return { ...state, ...pick(action.response, ['steps', 'owner', 'communityAddress']) }
    case FETCH_HOME_TOKEN_ADDRESS.SUCCESS:
      return { ...state, ...pick(action.response, ['homeTokenAddress', 'hasHomeTokenInNewBridge']) }
    case FETCH_HOME_TOKEN_ADDRESS.FAILURE:
      return { ...state, hasHomeTokenInNewBridge: false }
    case IS_USER_EXISTS.SUCCESS:
      return { ...state, ...action.response }
    default:
      return state
  }
}
