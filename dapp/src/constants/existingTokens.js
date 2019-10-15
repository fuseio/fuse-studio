import DaiLogo from 'images/DAI_logo.svg'
import UsdCoin from 'images/USD_Coin.svg'
import TetherLogo from 'images/tether_logo.svg'
import isEmpty from 'lodash/isEmpty'

export const existingTokens = (networkType) => ([
  {
    label: 'DAI',
    symbol: 'DAI',
    value: CONFIG.web3.addresses[networkType].DaiToken,
    isDisabled: false,
    icon: DaiLogo
  },
  {
    label: 'USD Coin',
    symbol: 'USDC',
    value: CONFIG.web3.addresses[networkType].UsdToken,
    isDisabled: false,
    icon: UsdCoin
  },
  {
    label: 'Tether USD',
    symbol: 'USDT',
    value: CONFIG.web3.addresses[networkType].TetherToken,
    isDisabled: false,
    icon: TetherLogo
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
