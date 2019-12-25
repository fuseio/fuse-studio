import { action, createRequestTypes, requestAction, createTransactionRequestTypes } from './utils'

export const ADD_COMMUNITY_PLUGIN = createRequestTypes('ADD_COMMUNITY_PLUGIN')
export const INVITE_USER_TO_COMMUNITY = createRequestTypes('INVITE_USER_TO_COMMUNITY')
export const TOGGLE_JOIN_BONUS = createTransactionRequestTypes('TOGGLE_JOIN_BONUS')

export const toggleJoinBonus = (isActive) => action(TOGGLE_JOIN_BONUS.REQUEST, { isActive })
export const inviteUserToCommunity = (communityAddress, options) => requestAction(INVITE_USER_TO_COMMUNITY, { communityAddress, ...options })
export const addCommunityPlugin = (communityAddress, plugin) => action(ADD_COMMUNITY_PLUGIN.REQUEST, { communityAddress, plugin })
