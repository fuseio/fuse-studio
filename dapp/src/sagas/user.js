import { all, put, select } from 'redux-saga/effects'

import { apiCall, tryTakeEvery } from './utils'
import * as actions from 'actions/user'
import { getAccountAddress } from 'selectors/accounts'
import * as api from 'services/api/user'
import { isUserProfileExists } from 'services/api/profiles'
import { saveState } from 'utils/storage'
import get from 'lodash/get'

export function * login ({ tokenId }) {
  const { token } = yield apiCall(api.login, { tokenId }, { v2: true })
  if (token) {
    saveState('state.user', { jwtToken: token, isAuthenticated: true })

    yield put({
      type: actions.LOGIN.SUCCESS,
      response: {
        jwtToken: token,
        isAuthenticated: true
      }
    })
  }
}

function * signUpUser ({ email, subscribe }) {
  const accountAddress = yield select(getAccountAddress)
  try {
    const accounts = yield select(state => state.accounts)
    const userInfo = accounts[accountAddress]
    const provider = get(userInfo, 'providerInfo.name').toLowerCase()
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
