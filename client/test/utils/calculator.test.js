import {assert} from 'chai'
import {predictClnReserves, calcClnGain} from 'utils/calculator'

describe('calcClnGain', () => {
  it('#1', () => {
    const actualClnGain = calcClnGain({averageTransactionInUsd: 30, clnPrice: 0.5, amountOfTransactions: 100, gainRatio: 0.1})
    const expectedClnGain = 150
    assert.equal(expectedClnGain, actualClnGain)
  })

  it('#2', () => {
    const actualClnGain = calcClnGain({averageTransactionInUsd: 30, clnPrice: 0.5, amountOfTransactions: 0, gainRatio: 0.1})
    const expectedClnGain = 0
    assert.equal(expectedClnGain, actualClnGain)
  })
})

describe('predictClnReserves', () => {
  it('#1', () => {
    const initialClnReserve = 100
    const amountOfTransactions = 100
    const averageTransactionInUsd = 30
    const clnPrice = 0.5
    const gainRatio = 0.1
    const iterations = 1

    const actualClnReserves = predictClnReserves({initialClnReserve,
      amountOfTransactions,
      averageTransactionInUsd,
      clnPrice,
      gainRatio,
      iterations})
    const expextedClnReserves = [100, 250]

    assert.equal(expextedClnReserves.length, actualClnReserves.length)
    assert.deepEqual(expextedClnReserves, actualClnReserves)
  })

  it('#2', () => {
    const initialClnReserve = 100
    const amountOfTransactions = 100
    const averageTransactionInUsd = 30
    const clnPrice = 0.5
    const gainRatio = 0.1
    const iterations = 6

    const actualClnReserves = predictClnReserves({initialClnReserve,
      amountOfTransactions,
      averageTransactionInUsd,
      clnPrice,
      gainRatio,
      iterations})
    const expextedClnReserves = [100, 250, 400, 550, 700, 850, 1000]

    assert.equal(expextedClnReserves.length, actualClnReserves.length)
    assert.deepEqual(expextedClnReserves, actualClnReserves)
  })
})
