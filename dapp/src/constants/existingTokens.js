import DaiIcon from 'images/dai_logo.png'
import UsdcIcon from 'images/usdc_logo.png'
import TrustIcon from 'images/trust_token_logo.png'
import TetherIcon from 'images/tether.png'
import EursTokenIcon from 'images/eurs_token.png'
import DigitalRandIcon from 'images/digital_rand_logo.png'
import RupiahIcon from 'images/rupiah_logo.png'

export const dollarPeggedTokens = (networkType) => networkType ? ([
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
  },
  {
    label: 'Trust Token',
    symbol: 'TUSD',
    value: CONFIG.web3.addresses[networkType].TrustToken,
    isDisabled: false,
    icon: TrustIcon
  }
]) : ([])

export const otherExistingTokens = (networkType) => networkType ? ([
  {
    label: 'Eurs (Europe)',
    symbol: 'EURS',
    value: CONFIG.web3.addresses[networkType].EursToken,
    isDisabled: false,
    icon: EursTokenIcon
  },
  {
    label: 'Digital Rand (South Africa)',
    symbol: 'DZAR',
    value: CONFIG.web3.addresses[networkType].DigitalRand,
    isDisabled: false,
    icon: DigitalRandIcon
  },
  {
    label: 'Rupiah token (Indonesia)',
    symbol: 'IDRT',
    value: CONFIG.web3.addresses[networkType].RupiahToken,
    isDisabled: false,
    icon: RupiahIcon
  }
]) : ([])
