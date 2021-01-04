import { all, put, call, takeEvery, select } from 'redux-saga/effects'

import * as actions from 'actions/accounts'
import { tryTakeEvery, createEntitiesFetch } from './utils'
import { getAddress, getCurrentNetworkType } from 'selectors/network'
import { CHECK_ACCOUNT_CHANGED, CHECK_NETWORK_TYPE, changeNetwork } from 'actions/network'
import { loadModal } from 'actions/ui'
import { TRANSFER_TOKEN, MINT_TOKEN, BURN_TOKEN, FETCH_TOKEN_TOTAL_SUPPLY } from 'actions/token'
import { getWeb3 } from 'sagas/network'
import { getAccountAddress, getAccount, getProviderInfo } from 'selectors/accounts'
import { fetchCommunities as fetchCommunitiesApi } from 'services/api/entities'
import BasicTokenABI from '@fuse/token-factory-contracts/abi/BasicToken'
import { loadState } from 'utils/storage'
import { SWITCH_NETWORK } from 'constants/uiConstants'

const fetchCommunities = createEntitiesFetch(actions.FETCH_COMMUNITIES, fetchCommunitiesApi)

function * fetchTokenTotalSupply ({ tokenAddress, options }) {
  const web3 = yield getWeb3(options)
  const basicTokenContract = new web3.eth.Contract(BasicTokenABI, tokenAddress)
  const totalSupply = yield call(basicTokenContract.methods.totalSupply().call)

  yield put({ type: FETCH_TOKEN_TOTAL_SUPPLY.SUCCESS,
    tokenAddress,
    response: {
      totalSupply
    }
  })
}

function * balanceOfToken ({ tokenAddress, accountAddress, options }) {
  if (accountAddress && tokenAddress) {
    const web3 = yield getWeb3(options)
    const basicTokenContract = new web3.eth.Contract(BasicTokenABI, tokenAddress)
    const balanceOf = yield call(basicTokenContract.methods.balanceOf(accountAddress).call)

    yield put({ type: actions.BALANCE_OF_TOKEN.SUCCESS,
      tokenAddress,
      accountAddress,
      response: {
        balanceOf
      } }
    )
  }
}

function * balanceOfNative ({ accountAddress, options }) {
  if (accountAddress) {
    const web3 = yield getWeb3(options)
    const balanceOfNative = yield call(web3.eth.getBalance, accountAddress)
    yield put({ type: actions.BALANCE_OF_NATIVE.SUCCESS,
      accountAddress,
      response: options ? { [`${options.bridgeType}`]: balanceOfNative } : { balanceOfNative }
    })
  }
}

function * balanceOfFuse ({ accountAddress }) {
  const networkType = yield select(getCurrentNetworkType)
  if (networkType === 'fuse') {
    yield call(balanceOfNative, { accountAddress })
  } else {
    const tokenAddress = yield select(getAddress, 'FuseToken')
    yield call(balanceOfToken, { tokenAddress, accountAddress })
  }
}

function * fetchBalances ({ accountAddress, tokens }) {
  for (let token of tokens) {
    yield put(actions.balanceOfToken(token.address, accountAddress))
  }
}

function * watchAccountChanged ({ response }) {
  yield put(actions.balanceOfFuse(response.accountAddress))
  yield put(actions.balanceOfNative(response.accountAddress, { bridgeType: 'home' }))
  yield put(actions.balanceOfNative(response.accountAddress, { bridgeType: 'foreign' }))
}

function * watchBalanceOfToken ({ response }) {
  const accountAddress = yield select(getAccountAddress)
  yield put(actions.balanceOfToken(response.tokenAddress, accountAddress))
}

function * initialAddress () {
  const rawAddress = loadState('state.userEthAddress')
  const currentAddress = rawAddress && rawAddress.toLowerCase()

  yield put({
    type: actions.GET_INITIAL_ADDRESS.SUCCESS,
    currentAddress,
    response: {
      currentAddress
    }
  })
}

function * postponeAction ({ accountAddress, postponed }) {
  const providerInfo = yield select(state => getProviderInfo(state))
  const { desiredNetworkType } = postponed.options

  if (providerInfo.type === 'web') {
    yield put(changeNetwork(postponed.options.desiredNetworkType))
  } else {
    yield put(loadModal(SWITCH_NETWORK, { desiredNetworkType }))
  }

  yield put({
    type: actions.POSTPONE_ACTION.SUCCESS,
    accountAddress,
    postponed
  })
}

function * executePostponedActions () {
  const account = yield select(getAccount)
  const { networkType } = yield select(state => state.network)
  if (account) {
    for (let action of account.postponed) {
      if (action.options && action.options.desiredNetworkType === networkType) {
        yield put(action)
        yield put(actions.postponedActionExecuted(account.accountAddress, action))
      }
    }
  }
}

function * watchCheckNetworkTypeSuccess ({ response }) {
  if (response.networkType === 'fuse') {
    window.analytics.track('User Switch to fuse network')
  }
  yield call(executePostponedActions)
}

export default function * accountsSaga () {
  yield all([
    tryTakeEvery(actions.BALANCE_OF_TOKEN, balanceOfToken),
    tryTakeEvery(actions.BALANCE_OF_NATIVE, balanceOfNative),
    tryTakeEvery(actions.BALANCE_OF_FUSE, balanceOfFuse),
    takeEvery(CHECK_ACCOUNT_CHANGED.SUCCESS, watchAccountChanged),
    tryTakeEvery(actions.FETCH_COMMUNITIES, fetchCommunities),
    takeEvery([TRANSFER_TOKEN.SUCCESS, BURN_TOKEN.SUCCESS, MINT_TOKEN.SUCCESS], watchBalanceOfToken),
    tryTakeEvery(actions.FETCH_BALANCES, fetchBalances, 1),
    tryTakeEvery(FETCH_TOKEN_TOTAL_SUPPLY, fetchTokenTotalSupply),
    tryTakeEvery(actions.GET_INITIAL_ADDRESS, initialAddress),
    tryTakeEvery(actions.POSTPONE_ACTION, postponeAction),
    takeEvery(CHECK_NETWORK_TYPE.SUCCESS, watchCheckNetworkTypeSuccess)
  ])
}
