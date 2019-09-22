import request from 'superagent'

export const API_ROOT = CONFIG.api.url.default

export const processReceipt = (apiRoot, { receipt, bridgeType }) =>
  request.post(`${apiRoot}/receipts/`).send({ receipt, bridgeType }).then(response => response.body)

export const processTransactionHash = (apiRoot, { transactionHash, bridgeType, abiName }) =>
  request.post(`${apiRoot}/receipts/${transactionHash}`).send({ abiName, bridgeType }).then(response => response.body)

export const sendContactUs = (formData) => request.post(`${API_ROOT}/mails`)
  .send({ formData })
  .then(response => response.body)
