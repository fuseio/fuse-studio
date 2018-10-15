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

  const receipt = yield CurrencyFactoryContract.methods.createCurrency(
    name,
    symbol,
    decimals,
    totalSupply,
    tokenURI
  ).send({
    from: accountAddress
  })

  if (!Number(receipt.status)) {
    yield put({
      type: actions.CREATE_CURRENCY.FAILURE,
      tokenAddress: receipt.address,
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
