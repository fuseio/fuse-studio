import {BigNumber} from 'bignumber.js'

export const ROUND_PRECISION = 5

export const roundUp = (value) => new BigNumber(value).toFixed(ROUND_PRECISION, BigNumber.ROUND_UP)
export const roundDown = (value) => new BigNumber(value).toFixed(ROUND_PRECISION, BigNumber.ROUND_DOWN)

export const clnFormatter = (value, isBuy) => inputFormatter(value, isBuy)
export const ccFormatter = (value, isBuy) => inputFormatter(value, !isBuy)

const inputFormatter = (value, isBuy) => (
  isBuy
    ? roundUp(value)
    : roundDown(value)
)
