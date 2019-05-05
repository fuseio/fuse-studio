import request from 'superagent'

export const login = (apiRoot, { accountAddress, signature, date }) =>
  request.post(`${apiRoot}/users/login/${accountAddress}`)
    .send({ signature, date })
    .then(response => response.body)

export const addUser = (apiRoot, { user, tokenAddress, authToken }) =>
  request.post(`${apiRoot}/users`).send({ user, tokenAddress })
    .set('Authorization', `Bearer ${authToken}`)
    .then(response => response.body)

export const isUserExists = (apiRoot, { accountAddress }) =>
  request.get(`${apiRoot}/users/${accountAddress}`)
    .then(response => response.body)
