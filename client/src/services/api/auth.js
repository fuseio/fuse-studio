import request from 'superagent'

export const login = (apiRoot, {accountAddress, signature, date}) =>
  request.post(`${apiRoot}/users/login/${accountAddress}`)
    .send({signature, date})
    .then(response => response.body)
