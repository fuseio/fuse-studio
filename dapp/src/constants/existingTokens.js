import DaiIcon from 'images/dai_logo.png'
import UsdcIcon from 'images/usdc_logo.png'
import TetherIcon from 'images/tether.png'
import MoneriumIcon from 'images/monerium.jpeg'

export const dollarPeggedTokens = (foreignNetwork = 'main', homeNetwork = 'fuse') => {
  return [
    {
      label: 'DAI',
      symbol: 'DAI',
      value: CONFIG.web3.addresses[homeNetwork].DaiToken,
      foreignTokenAddress: CONFIG.web3.addresses[foreignNetwork].DaiToken,
      isDisabled: false,
      icon: DaiIcon
    },
    {
      label: 'USD Coin',
      symbol: 'USDC',
      value: CONFIG.web3.addresses[homeNetwork].UsdToken,
      foreignTokenAddress: CONFIG.web3.addresses[foreignNetwork].UsdToken,
      isDisabled: false,
      icon: UsdcIcon
    },
    {
      label: 'Tether USD',
      symbol: 'USDT',
      value: CONFIG.web3.addresses[homeNetwork].TetherToken,
      foreignTokenAddress: CONFIG.web3.addresses[foreignNetwork].TetherToken,
      isDisabled: false,
      icon: TetherIcon
    },
  ]
}

export const otherExistingTokens = (foreignNetwork = 'main', homeNetwork = 'fuse') => {
  return [
    {
      label: 'Monerium EUR (Europe)',
      symbol: 'EURe',
      value: CONFIG.web3.addresses[homeNetwork].MoneriumToken,
      foreignTokenAddress: CONFIG.web3.addresses[foreignNetwork].MoneriumToken,
      isDisabled: false,
      icon: MoneriumIcon
    },
  ]
}
