import request from 'superagent'

export const login = (apiRoot, { accountAddress, signature, date }) =>
  request.post(`${apiRoot}/users/login/${accountAddress}`)
    .send({ signature, date })
    .then(response => response.body)

export const saveWizardProgress = (apiRoot, { accountAddress, formData }) =>
  request.post(`${apiRoot}/wizard`)
    .send({ accountAddress, formData })
    .then(response => response.body)

export const signUpUser = (apiRoot, { user }) =>
  request.post(`${apiRoot}/users`).send(user)
    .then(response => response.body)

export const isUserExists = (apiRoot, { accountAddress }) =>
  request.get(`${apiRoot}/users/${accountAddress}`)
    .then(response => response.body)

export const subscribeUser = (apiRoot, { user }) =>
  request.post(`${apiRoot}/email/subscribe`)
    .send({ user })
    .then(response => response.body)
