import DaiIcon from 'images/dai.svg'
import UsdcIcon from 'images/usdc.png'
import TetherIcon from 'images/tether.png'

export const existingTokens = (networkType) => networkType ? ([
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
]) : ([])
