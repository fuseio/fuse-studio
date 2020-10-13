import request from 'superagent'

export const fundEth = (apiRoot, { accountAddress }) =>
  request.post(`${apiRoot}/fund/${accountAddress}`)
    .send()
    .then(response => response.body)

export const fetchEthFundStatus = (apiRoot, { id }) =>
  request.get(`${apiRoot}/jobs/${id}`)
    .send()
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
