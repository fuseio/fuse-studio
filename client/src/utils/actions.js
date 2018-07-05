import filter from 'lodash/filter'
import keyBy from 'lodash/keyBy'

export const filterSuccessActions = (actions) => {
  return keyBy(filter(actions, action => action.hasOwnProperty('SUCCESS')), 'SUCCESS')
}
