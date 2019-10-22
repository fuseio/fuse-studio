import DaiIcon from 'images/dai.png'
import UsdcIcon from 'images/usdc.png'
import TetherIcon from 'images/tether.png'
import isEmpty from 'lodash/isEmpty'

export const existingTokens = (networkType) => ([
  {
    label: 'DAI',
    symbol: 'DAI',
    value: CONFIG.web3.addresses[networkType].DaiToken,
    isDisabled: false,
    icon: DaiIcon
  },
  {
    label: 'USD Coin',
    symbol: 'USDC',
    value: CONFIG.web3.addresses[networkType].UsdToken,
    isDisabled: false,
    icon: UsdcIcon
  },
  {
    label: 'Tether USD',
    symbol: 'USDT',
    value: CONFIG.web3.addresses[networkType].TetherToken,
    isDisabled: false,
    icon: TetherIcon
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
