import {BigNumber} from 'bignumber.js'

export const ROUND_PRECISION = 4
export const MAX_PRECISION = 18

export const formatWei = (value) => new BigNumber(value).div(1e18).toFormat(ROUND_PRECISION, BigNumber.ROUND_HALF_UP)
export const formatEther = (value) => new BigNumber(value).toFormat(ROUND_PRECISION, BigNumber.ROUND_HALF_UP)

const pickLetters = (word, numOfLetters) => word.substr(0, numOfLetters).toUpperCase()

export const nameToSymbol = (name) => {
  const words = name.trim(' ').split(/\s+/)
  if (words.length === 1) {
    return pickLetters(words[0], 3)
  } else if (words.length === 2) {
    return pickLetters(words[0], 2) + pickLetters(words[1], 1)
  } else if (words.length === 3) {
    return pickLetters(words[0], 1) + pickLetters(words[1], 1) + pickLetters(words[2], 1)
  } else if (words.length >= 4) {
    return pickLetters(words[0], 1) + pickLetters(words[1], 1) + pickLetters(words[2], 1) + pickLetters(words[3], 1)
  }
}
