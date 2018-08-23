import {BigNumber} from 'bignumber.js'

export const ROUND_PRECISION = 4
export const MAX_PRECISION = 18

export const formatWei = (value) => new BigNumber(value).div(1e18).toFormat(ROUND_PRECISION, BigNumber.ROUND_HALF_UP)
export const formatEther = (value) => new BigNumber(value).toFormat(ROUND_PRECISION, BigNumber.ROUND_HALF_UP)
