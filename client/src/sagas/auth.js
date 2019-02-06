import { all, put, select } from 'redux-saga/effects'

import { apiCall, tryTakeEvery } from './utils'
import * as actions from 'actions/auth'
import {getAccountAddress} from 'selectors/accounts'
import web3 from 'services/web3'
import * as api from 'services/api/auth'
import {generateSignatureData} from 'utils/web3'

function * login () {
  const accountAddress = yield select(getAccountAddress)
  const chainId = yield select(state => state.network.networkId)

  const date = new Date().toUTCString()

  const signatureData = generateSignatureData({accountAddress, date, chainId})
  const promise = new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(
      {
        method: 'eth_signTypedData_v3',
        params: [accountAddress, JSON.stringify(signatureData)],
        from: accountAddress
      },
      (error, {result}) => {
        if (error) {
          return reject(error)
        }
        return resolve(result)
      }
    )
  })
  const signature = yield promise
  if (signature) {
    const response = yield apiCall(api.login, {accountAddress, signature, date})
    yield put({
      type: actions.LOGIN.SUCCESS,
      accountAddress,
      response: {
        authToken: response.token
      }
    })
  }
}

export default function * authSaga () {
  yield all([
    tryTakeEvery(actions.LOGIN, login, 1)
  ])
}
