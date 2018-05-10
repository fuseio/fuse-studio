import {action, createRequestTypes} from './utils'

export const ADD_COMMUNITY = createRequestTypes('ADD_COMMUNITY')

export const addCommunity = (community) => action(ADD_COMMUNITY.REQUEST, {community})
