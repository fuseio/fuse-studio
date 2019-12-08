import { all, put, select } from 'redux-saga/effects'

import { apiCall, tryTakeEvery } from './utils'
import * as actions from 'actions/user'
import { getAccountAddress } from 'selectors/accounts'
import * as api from 'services/api/user'
import { isUserProfileExists } from 'services/api/profiles'
import { generateSignatureData } from 'utils/web3'
import { saveState } from 'utils/storage'

export function * login () {
  const accountAddress = yield select(getAccountAddress)
  const chainId = yield select(state => state.network.networkId)

  const date = new Date().toUTCString()

  const signatureData = generateSignatureData({ accountAddress, date, chainId })
  const promise = new Promise((resolve, reject) => {
    window.ethereum.sendAsync(
      {
        method: 'eth_signTypedData_v3',
        params: [accountAddress, JSON.stringify(signatureData)],
        from: accountAddress
      },
      (error, { result }) => {
        if (error) {
          return reject(error)
        }
        return resolve(result)
      }
    )
  })
  const signature = yield promise
  if (signature) {
    const response = yield apiCall(api.login, { accountAddress, signature, date })
    yield put({
      type: actions.LOGIN.SUCCESS,
      accountAddress,
      response: {
        authToken: response.token
      }
    })
  }
}

function * signUpUser ({ email, subscribe }) {
  const accountAddress = yield select(getAccountAddress)
  try {
    const network = yield select(state => state.network)
    const provider = network.isMetaMask ? 'metamask' : network.isPortis ? 'portis' : 'unknown'

    const response = yield apiCall(api.signUpUser,
      { user: { accountAddress, email, provider, subscribe, source: 'studio' } }, { v2: true })

    const { data } = response
    yield put({
      type: actions.SIGN_UP_USER.SUCCESS,
      accountAddress,
      response: {
        data
      }
    })
  } catch (error) {
    console.log(error)
    yield put({
      type: actions.SIGN_UP_USER.FAILURE,
      accountAddress,
      error
    })
  }
}

function * saveWizardProgress ({ formData }) {
  const accountAddress = yield select(getAccountAddress)
  try {
    const response = yield apiCall(api.saveWizardProgress, { accountAddress, formData })
    const { data } = response
    yield put({
      type: actions.SAVE_WIZARD_PROGRESS.SUCCESS,
      accountAddress,
      response: {
        data
      }
    })
  } catch (error) {
    yield put({
      type: actions.SAVE_WIZARD_PROGRESS.FAILURE,
      accountAddress,
      response: {
        error
      }
    })
  }
}

function * subscribeUser ({ user }) {
  yield apiCall(api.subscribeUser, { user: { ...user } })
  saveState('subscribe', true)
}

function * isUserExists ({ accountAddress }) {
  const response = yield apiCall(isUserProfileExists, { accountAddress })

  yield put({
    type: actions.IS_USER_EXISTS.SUCCESS,
    accountAddress,
    response
  })
}

export default function * userSaga () {
  yield all([
    tryTakeEvery(actions.LOGIN, login, 1),
    tryTakeEvery(actions.SIGN_UP_USER, signUpUser, 1),
    tryTakeEvery(actions.SAVE_WIZARD_PROGRESS, saveWizardProgress, 1),
    tryTakeEvery(actions.IS_USER_EXISTS, isUserExists, 1),
    tryTakeEvery(actions.SEND_EMAIL, subscribeUser, 1)
  ])
}
