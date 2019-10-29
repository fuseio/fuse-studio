import { action, createRequestTypes, createTransactionRequestTypes } from './utils'

export const ADD_COMMUNITY_PLUGIN = createRequestTypes('ADD_COMMUNITY_PLUGIN')
export const TOGGLE_JOIN_BONUS = createTransactionRequestTypes('TOGGLE_JOIN_BONUS')

export const toggleJoinBonus = (isActive) => action(TOGGLE_JOIN_BONUS.REQUEST, { isActive })
export const addCommunityPlugin = (communityAddress, plugin) => action(ADD_COMMUNITY_PLUGIN.REQUEST, { communityAddress, plugin })
