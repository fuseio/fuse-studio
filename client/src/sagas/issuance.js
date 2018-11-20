import { all, put, select } from 'redux-saga/effects'
import { contract } from 'osseus-wallet'
import {getAddresses} from 'selectors/network'

import * as actions from 'actions/issuance'
import {tryTakeEvery} from './utils'
import {getAccountAddress} from 'selectors/accounts'

export function * createCurrency ({name, symbol, decimals, totalSupply, tokenURI}) {
  const addresses = yield select(getAddresses)
  const CurrencyFactoryContract = contract.getContract({abiName: 'CurrencyFactory',
    address: addresses.CurrencyFactory
  })
  const accountAddress = yield select(getAccountAddress)

  const createCurrencyPromise = CurrencyFactoryContract.methods.createCurrency(
    name,
    symbol,
    decimals,
    totalSupply,
    tokenURI
  ).send({
    from: accountAddress
  })

  const transactionHash = yield new Promise((resolve, reject) => {
    createCurrencyPromise.on('transactionHash', (transactionHash) =>
      resolve(transactionHash)
    )
    createCurrencyPromise.on('error', (error) =>
      reject(error)
    )
  })

  yield put({type: actions.CREATE_CURRENCY.PENDING,
    response: {
      transactionHash
    }
  })

  const receipt = yield createCurrencyPromise

  if (!Number(receipt.status)) {
    yield put({
      type: actions.CREATE_CURRENCY.FAILURE,
      accountAddress,
      response: {receipt}
    })
    return receipt
  }

  yield put({type: actions.CREATE_CURRENCY.SUCCESS,
    tokenAddress: receipt.address,
    accountAddress,
    response: {
      receipt
    }
  })
  return receipt
}

export default function * marketMakerSaga () {
  yield all([
    tryTakeEvery(actions.CREATE_CURRENCY, createCurrency, 1)
  ])
}
