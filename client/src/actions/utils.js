
export const FETCH_SUPPORTS_TOKEN_REQUESTED = 'FETCH_SUPPORTS_TOKEN_REQUESTED'
export const FETCH_TOKEN_NAME_REQUESTED = 'FETCH_TOKEN_NAME_REQUESTED'
export const GET_NETWORK = 'GET_NETWORK'

export const action = (type, payload = {}) => ({
  type, ...payload
})

const REQUEST = 'REQUEST'
const SUCCESS = 'SUCCESS'
const FAILURE = 'FAILURE'

export function createRequestTypes (base) {
  return [REQUEST, SUCCESS, FAILURE].reduce((acc, type) => {
    acc[type] = `${base}_${type}`
    return acc
  }, {})
}

export const createEntityAction = (entity) => (...args) =>
  ({...action.apply(null, args), entity})
