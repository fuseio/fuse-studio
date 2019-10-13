import DaiLogo from 'images/DAI_logo.svg'
import isEmpty from 'lodash/isEmpty'

export const existingTokens = (networkType) => ([
  {
    label: 'DAI',
    value: CONFIG.web3.addresses[networkType].DaiToken,
    isDisabled: false,
    icon: DaiLogo
  },
  {
    label: 'More token soon!',
    value: undefined,
    isDisabled: true
  }
])

export const isDaiToken = (networkType, token) => {
  if (!token) {
    return false
  }

  const item = existingTokens(networkType).filter(({ value, label }) => value === token.address && label === token.symbol)

  if (!isEmpty(item)) {
    return true
  }

  return false
}
