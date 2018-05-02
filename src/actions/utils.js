
export const FETCH_SUPPORTS_TOKEN_REQUESTED = 'FETCH_SUPPORTS_TOKEN_REQUESTED'
export const FETCH_TOKEN_NAME_REQUESTED = 'FETCH_TOKEN_NAME_REQUESTED'
export const GET_NETWORK = 'GET_NETWORK'

export function action (type, payload = {}) {
  return {type, ...payload}
}

const REQUEST = 'REQUEST'
const SUCCESS = 'SUCCESS'
const FAILURE = 'FAILURE'

export function createRequestTypes (base) {
  return [REQUEST, SUCCESS, FAILURE].reduce((acc, type) => {
    acc[type] = `${base}_${type}`
    return acc
  }, {})
}

export const fetchSupportsToken = (tokenAddress) => action(FETCH_SUPPORTS_TOKEN_REQUESTED, {tokenAddress})
export const getNetwork = () => action(GET_NETWORK)
