import { all, put, call, takeEvery, select } from 'redux-saga/effects'

import * as actions from 'actions/accounts'
import { tryTakeEvery, createEntitiesFetch } from './utils'
import { getAddress, getNetworkType, getNetworkSide } from 'selectors/network'
import { CHECK_ACCOUNT_CHANGED } from 'actions/network'
import { TRANSFER_TOKEN, MINT_TOKEN, BURN_TOKEN } from 'actions/token'
import { fetchTokenList } from 'sagas/token'
import { getWeb3, get3box } from 'services/web3'
import { getContract } from 'services/contract'
import { getAccountAddress } from 'selectors/accounts'
import { fetchCommunities as fetchCommunitiesApi } from 'services/api/entities'
import { createEntitiesMetadata } from 'sagas/metadata'

function * balanceOfToken ({ tokenAddress, accountAddress, options }) {
  const basicTokenContract = getContract({ abiName: 'BasicToken', address: tokenAddress, options })
  const balanceOf = yield call(basicTokenContract.methods.balanceOf(accountAddress).call)

  yield put({ type: actions.BALANCE_OF_TOKEN.SUCCESS,
    tokenAddress,
    accountAddress,
    response: {
      balanceOf
    } }
  )
}

function * balanceOfNative ({ accountAddress }) {
  const web3 = yield getWeb3()
  const balanceOfNative = yield call(web3.eth.getBalance, accountAddress)

  yield put({ type: actions.BALANCE_OF_NATIVE.SUCCESS,
    accountAddress,
    response: {
      balanceOfNative
    } })
}

function * balanceOfFuse ({ accountAddress }) {
  const networkType = yield select(getNetworkType)
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

function * fetchTokensWithBalances ({ accountAddress }) {
  const networkSide = yield select(getNetworkSide)
  const tokens = yield call(fetchTokenList, { accountAddress, networkSide, entity: 'tokens' })
  yield call(fetchBalances, { accountAddress, tokens, networkSide })
}

const fetchCommunities = createEntitiesFetch(actions.FETCH_COMMUNITIES, fetchCommunitiesApi)

function * signIn ({ accountAddress }) {
  const box = yield call(get3box, { accountAddress })

  const name = yield box.public.get('name')
  const address = yield box.public.get('address')
  const image = yield box.public.get('image')

  const email = yield box.private.get('email')
  const phoneNumber = yield box.private.get('phoneNumber')

  const publicData = { name, image, address }
  const privateData = { email, phoneNumber }

  yield put({ type: actions.SIGN_IN.SUCCESS,
    accountAddress,
    response: {
      isBoxConnected: true,
      accountAddress,
      publicData,
      privateData
    }
  })
}

function * create3boxProfile ({ accountAddress, data }) {
  yield call(createEntitiesMetadata, { accountAddress, metadata: data })

  yield put({ type: actions.CREATE_3BOX_PROFILE.SUCCESS,
    accountAddress,
    response: {
      isBoxConnected: true,
      accountAddress
    }
  })
}

function * watchAccountChanged ({ response }) {
  yield put(actions.balanceOfFuse(response.accountAddress))
}

function * watchBalanceOfToken ({ response }) {
  const accountAddress = yield select(getAccountAddress)
  yield put(actions.balanceOfToken(response.tokenAddress, accountAddress))
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
    tryTakeEvery(actions.SIGN_IN, signIn, 1),
    tryTakeEvery(actions.CREATE_3BOX_PROFILE, create3boxProfile, 1),
    tryTakeEvery(actions.FETCH_TOKENS_WITH_BALANCES, fetchTokensWithBalances, 1)
  ])
}
