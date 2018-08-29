import { all, put, select } from 'redux-saga/effects'
import { contract } from 'osseus-wallet'
import {getAddresses} from 'selectors/network'

import * as actions from 'actions/issuance'
import {tryTakeEvery} from './utils'
import web3 from 'services/web3'

function * createCurrency ({name, symbol, decimals, totalSupply, tokenURI}) {
  const addresses = yield select(getAddresses)
  const CurrencyFactoryContract = contract.getContract({abiName: 'CurrencyFactory',
    address: addresses.CurrencyFactory
  })
  const receipt = yield CurrencyFactoryContract.methods.createCurrency(
    name,
    symbol,
    decimals,
    totalSupply,
    tokenURI
  ).send({
    from: web3.eth.defaultAccount
  })

  if (!Number(receipt.status)) {
    yield put({
      type: actions.CREATE_CURRENCY.FAILURE,
      tokenAddress: receipt.address,
      accountAddress: web3.eth.defaultAccount,
      response: {receipt}
    })
    return receipt
  }

  yield put({type: actions.CREATE_CURRENCY.SUCCESS,
    tokenAddress: receipt.address,
    accountAddress: web3.eth.defaultAccount,
    response: {
      receipt
    }
  })
}

export default function * marketMakerSaga () {
  yield all([
    tryTakeEvery(actions.CREATE_CURRENCY, createCurrency, 1)
  ])
}
