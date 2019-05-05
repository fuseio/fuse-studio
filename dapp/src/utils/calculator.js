
export const predictClnReserves = ({ initialClnReserve,
  amountOfTransactions, averageTransactionInUsd, clnPrice, gainRatio, iterations }) => {
  const clnGain = calcClnGain({ averageTransactionInUsd, clnPrice, amountOfTransactions, gainRatio })
  let nextClnReserve = initialClnReserve
  const clnReserves = [nextClnReserve]
  for (let i = 0; i < iterations; i++) {
    nextClnReserve += clnGain
    clnReserves.push(nextClnReserve)
  }
  return clnReserves
}

export const calcClnGain = ({ averageTransactionInUsd, clnPrice, amountOfTransactions, gainRatio }) => {
  const averageTransactionInCln = averageTransactionInUsd / clnPrice
  return averageTransactionInCln * amountOfTransactions * gainRatio
}
