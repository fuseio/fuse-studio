import request from 'superagent'

export const API_ROOT = CONFIG.api.url.default

export const processReceipt = (apiRoot, { receipt }) =>
  request.post(`${apiRoot}/receipts/`).send({ receipt }).then(response => response.body)

export const sendContactUs = (formData) => request.post(`${API_ROOT}/mails`)
  .send({ formData })
  .then(response => response.body)
