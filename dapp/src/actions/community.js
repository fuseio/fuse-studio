import { action, createRequestTypes } from './utils'

export const ADD_COMMUNITY_PLUGINS = createRequestTypes('ADD_PLUGINS')

export const addCommunityPlugins = (communityAddress, plugins) => action(ADD_COMMUNITY_PLUGINS.REQUEST, { communityAddress, plugins })
