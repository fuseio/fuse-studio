import request from 'superagent'

export const fetchBusinesses = (apiRoot, {listAddress, page}) =>
  request.get(`${apiRoot}/businesses/${listAddress}?page=${page}`)
    .then(response => response.body)
