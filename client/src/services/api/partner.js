import request from 'superagent'

export const fetchPartners = (apiRoot, {page}) =>
  request.get(`${apiRoot}/partners?page=${page}`).then(response => response.body)
