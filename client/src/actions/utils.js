export const action = (type, payload = {}) => ({
  type, ...payload
})

export const REQUEST = 'REQUEST'
export const SUCCESS = 'SUCCESS'
export const FAILURE = 'FAILURE'

export function createRequestTypes (base) {
  return [REQUEST, SUCCESS, FAILURE].reduce((acc, type) => {
    acc[type] = `${base}_${type}`
    return acc
  }, {})
}

export const createEntityAction = (entity) => (...args) =>
  ({...action.apply(null, args), entity})
