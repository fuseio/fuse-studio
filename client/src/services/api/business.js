import request from 'superagent'

export const fetchBusinesses = (apiRoot, { listAddress, page }) =>
  request.get(`${apiRoot}/businesses/${listAddress}?page=${page}`)
    .then(response => response.body)

export const fetchBusiness = (apiRoot, { listAddress, hash }) =>
  request.get(`${apiRoot}/businesses/${listAddress}/${hash}`)
    .then(response => response.body)
