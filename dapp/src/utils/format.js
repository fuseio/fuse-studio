import { BigNumber } from 'bignumber.js'

export const ROUND_PRECISION = 4
export const MAX_PRECISION = 18

export const formatWei = (value, round = ROUND_PRECISION, decimals = 18) => new BigNumber(value).div(10 ** decimals).toFormat(round, BigNumber.ROUND_HALF_UP)
export const formatEther = (value, round = ROUND_PRECISION) => new BigNumber(value).toFormat(round, BigNumber.ROUND_HALF_UP)

export const toWei = (value, decimals = 18) => new BigNumber(value).multipliedBy(10 ** decimals).toFixed()

const pickLetters = (word, numOfLetters) => word.substr(0, numOfLetters).toUpperCase()

export const nameToSymbol = (name) => {
  const words = name.trim(' ').split(/\s+/)
  switch (words.length) {
    case 1: return pickLetters(words[0], 3)
    case 2: return pickLetters(words[0], 2) + pickLetters(words[1], 1)
    case 3: return pickLetters(words[0], 1) + pickLetters(words[1], 1) + pickLetters(words[2], 1)
    case 4: return pickLetters(words[0], 1) + pickLetters(words[1], 1) + pickLetters(words[2], 1) + pickLetters(words[3], 1)
    default: return pickLetters(words[0], 1) + pickLetters(words[1], 1) + pickLetters(words[2], 1) + pickLetters(words[3], 1)
  }
}

export const addressShortener = (address) => address ? `${address.substring(0, 6)}...${address.substring(address.length - 4, address.length)}` : ''

export const formatNumber = (num) => String(num).replace(/(.)(?=(\d{3})+$)/g, '$1,')
