import DaiLogo from 'images/DAI_logo.svg'

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

  const item = existingTokens(networkType).filter(({ value }) => value === token.address)

  if (item) {
    return true
  }

  return false
}

export const checkImportedToken = (token, networkType) => {
  return existingTokens(networkType).find(({ value, label }) => value === token.address && token.symbol === label)
}
