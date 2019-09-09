import { action, createRequestTypes, createTransactionRequestTypes } from './utils'

export const ADD_COMMUNITY_PLUGINS = createRequestTypes('ADD_PLUGINS')
export const TOGGLE_JOIN_BONUS = createTransactionRequestTypes('TOGGLE_JOIN_BONUS')

export const addCommunityPlugins = (communityAddress, plugins) => action(ADD_COMMUNITY_PLUGINS.REQUEST, { communityAddress, plugins })
export const toggleJoinBonus = (toSend) => action(TOGGLE_JOIN_BONUS.REQUEST, { toSend })
