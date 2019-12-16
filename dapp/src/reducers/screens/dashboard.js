import { FETCH_TOKEN_PROGRESS, FETCH_TOKEN_TOTAL_SUPPLY, FETCH_COMMUNITY_DATA } from 'actions/token'
import { IS_USER_EXISTS } from 'actions/user'
import pick from 'lodash/pick'

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_COMMUNITY_DATA.SUCCESS:
      return { ...state, fetchCommunityData: false, communityAddress: action.communityAddress }
    case FETCH_COMMUNITY_DATA.REQUEST:
      return { ...state, fetchCommunityData: true }
    case FETCH_TOKEN_TOTAL_SUPPLY.SUCCESS:
      return { ...state, totalSupply: { ...state.totalSupply, [action.tokenAddress]: action.response.totalSupply } }
    case FETCH_TOKEN_PROGRESS.SUCCESS:
      return { ...state, ...pick(action.response, ['steps', 'owner', 'communityAddress']) }
    case IS_USER_EXISTS.SUCCESS:
      return { ...state, ...action.response }
    default:
      return state
  }
}
