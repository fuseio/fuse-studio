import DollarIcon from 'images/fiat-on-ramp-white.svg'
import DollarYellowIcon from 'images/fiat-on-ramp-selected.svg'
import JoinBonusIcon from 'images/join_bonus.svg'
import JoinBonusYellowIcon from 'images/join_bonus_selected.svg'
import BusinessIcon from 'images/business_list.svg'
import BusinessYellowIcon from 'images/business_list_yellow.svg'
import WallerBannerLinkIcon from 'images/wallet-banner-link.svg'
import WallerBannerLinkYellowIcon from 'images/wallet-banner-link-selected.svg'

const allPlugins = (isAdmin) => isAdmin ? ({
  businessList: {
    name: 'Business list',
    path: '/merchants',
    url: (match) => `${match}/merchants`,
    icon: BusinessIcon,
    selectedIcon: BusinessYellowIcon
  },
  joinBonus: {
    name: 'Join bonus',
    path: '/bonus',
    url: (match) => `${match}/bonus`,
    icon: JoinBonusIcon,
    selectedIcon: JoinBonusYellowIcon
  },
  onramp: {
    name: 'Fiat on ramp',
    path: '/onramp',
    url: (match) => `${match}/onramp`,
    icon: DollarIcon,
    selectedIcon: DollarYellowIcon
  },
  walletBanner: {
    name: 'Wallet banner link',
    path: '/walletbanner',
    url: (match) => `${match}/walletbanner`,
    icon: WallerBannerLinkIcon,
    selectedIcon: WallerBannerLinkYellowIcon
  }
}) : ({
  businessList: {
    name: 'Business list',
    path: '/merchants',
    url: (match) => `${match}/merchants`,
    icon: BusinessIcon,
    selectedIcon: BusinessYellowIcon
  }
})

export default allPlugins
