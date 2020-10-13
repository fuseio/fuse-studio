import { all, put, select, call } from 'redux-saga/effects'
import { apiCall, tryTakeEvery } from './utils'
import * as actions from 'actions/user'
import { balanceOfNative } from 'actions/accounts'
import { getAccountAddress } from 'selectors/accounts'
import * as api from 'services/api/user'
import { isUserProfileExists } from 'services/api/profiles'
import { saveState } from 'utils/storage'
import get from 'lodash/get'
import { getWeb3 } from 'sagas/network'
import BigNumber from 'bignumber.js'

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

function * fundEth ({ accountAddress }) {
  if (accountAddress) {
    const response = yield apiCall(api.fundEth, { accountAddress }, { networkType: 'ropsten' })
    saveState('fundEth', true)
    yield put({
      type: actions.FUND_ETH.SUCCESS,
      accountAddress,
      response: {
        jobId: response['job']['_id']
      }
    })
  }
}

function * fetchFundingStatus () {
  const accountAddress = yield select(getAccountAddress)
  const { jobId } = yield select(state => state.screens.issuance)
  try {
    const response = yield apiCall(api.fetchEthFundStatus, { id: jobId }, { networkType: 'ropsten' })
    const web3 = yield getWeb3({ bridgeType: 'foreign' })
    const balance = yield call(web3.eth.getBalance, accountAddress)
    const { data } = response
    if (data.failReason && data.failedAt) {
      yield put({
        type: actions.GET_FUND_STATUS.FAILURE,
        response: {
          fundingStatus: 'failed'
        }
      })
    }

    if (get(data, 'data.txHash', false)) {
      yield put({
        type: actions.GET_FUND_STATUS.SUCCESS,
        response: {
          fundingTxHash: get(data, 'data.txHash')
        }
      })
    }
    if (get(data, 'data.receipt', false) || !(new BigNumber(balance).isZero())) {
      yield put(balanceOfNative(accountAddress, { bridgeType: 'home' }))
      yield put(balanceOfNative(accountAddress, { bridgeType: 'foreign' }))
      yield put({
        type: actions.GET_FUND_STATUS.SUCCESS,
        response: {
          fundingStatus: 'success'
        }
      })
    }
  } catch (error) {
    yield put({
      type: actions.GET_FUND_STATUS.FAILURE,
      response: {
        fundingStatus: 'failed'
      }
    })
  }
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
    tryTakeEvery(actions.SIGN_UP_USER, signUpUser, 1),
    tryTakeEvery(actions.SAVE_WIZARD_PROGRESS, saveWizardProgress, 1),
    tryTakeEvery(actions.IS_USER_EXISTS, isUserExists, 1),
    tryTakeEvery(actions.SEND_EMAIL, subscribeUser, 1),
    tryTakeEvery(actions.FUND_ETH, fundEth, 1),
    tryTakeEvery(actions.GET_FUND_STATUS, fetchFundingStatus, 1)
  ])
}
