import { all, put, call, takeEvery, select } from 'redux-saga/effects'

import * as actions from 'actions/accounts'
import { tryTakeEvery, createEntitiesFetch } from './utils'
import { getAddress, getCurrentNetworkType } from 'selectors/network'
import { CHECK_ACCOUNT_CHANGED } from 'actions/network'
import { TRANSFER_TOKEN, MINT_TOKEN, BURN_TOKEN, FETCH_TOKEN_TOTAL_SUPPLY } from 'actions/token'
import { getWeb3, get3box } from 'services/web3'
import { getAccountAddress, getAccount } from 'selectors/accounts'
import { fetchCommunities as fetchCommunitiesApi } from 'services/api/entities'
import { createUsersMetadata } from 'sagas/metadata'
import { separateData } from 'utils/3box'
import { isUserExists } from 'actions/user'
import BasicTokenABI from '@fuse/token-factory-contracts/abi/BasicToken'
import { loadState } from 'utils/storage'

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
  const web3 = yield getWeb3(options)
  const balanceOfNative = yield call(web3.eth.getBalance, accountAddress)

  yield put({ type: actions.BALANCE_OF_NATIVE.SUCCESS,
    accountAddress,
    response: options ? { [`${options.bridgeType}`]: balanceOfNative } : { balanceOfNative }
  })
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

function * signIn ({ accountAddress }) {
  yield put(isUserExists(accountAddress))
  const box = yield call(get3box, { accountAddress })
  const profilePublicData = yield box.public.all()
  const privatePrivateData = yield box.private.all()
  const { publicData } = separateData({ ...profilePublicData, type: 'user' })
  const { privateData } = separateData(privatePrivateData)

  const { userExists } = yield select(getAccount)

  if (!userExists) {
    yield call(create3boxProfile, { accountAddress, data: { ...publicData, ...privateData } })
  }

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
  yield call(createUsersMetadata, { accountAddress, metadata: data })

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
    tryTakeEvery(FETCH_TOKEN_TOTAL_SUPPLY, fetchTokenTotalSupply),
    tryTakeEvery(actions.GET_INITIAL_ADDRESS, initialAddress)
  ])
}
