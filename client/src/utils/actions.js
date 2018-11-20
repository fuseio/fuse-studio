import filter from 'lodash/filter'
import keyBy from 'lodash/keyBy'
import {SUCCESS, REQUEST} from 'actions/constants'

export const filterActions = (type, actions) =>
  keyBy(filter(actions, action => action.hasOwnProperty(type)), type)
export const filterSuccessActions = (actions) => filterActions(SUCCESS, actions)
export const filterRequestActions = (actions) => filterActions(REQUEST, actions)
