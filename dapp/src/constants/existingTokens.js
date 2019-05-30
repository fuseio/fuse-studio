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

export const checkImportedToken = (token, networkType) => {
  return existingTokens(networkType).find(({ value, label }) => value === token.address && token.symbol === label)
}
