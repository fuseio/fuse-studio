import DollarIcon from 'images/fiat-on-ramp-white.svg'
import DollarYellowIcon from 'images/fiat-on-ramp-selected.svg'
import JoinBonusIcon from 'images/join_bonus.svg'
import JoinBonusYellowIcon from 'images/join_bonus_selected.svg'
import BusinessIcon from 'images/business_list.svg'
import BusinessYellowIcon from 'images/business_list_yellow.svg'
import WallerBannerLinkIcon from 'images/wallet-banner-link.svg'
import WallerBannerLinkYellowIcon from 'images/wallet-banner-link-selected.svg'

const openPlugins = {
  businessList: {
    name: 'Business list',
    path: '/merchants',
    url: (match) => `${match}/merchants`,
    icon: BusinessIcon,
    selectedIcon: BusinessYellowIcon
  },
  bridge: {
    name: 'Bridge',
    path: '/bridge',
    url: (match) => `${match}/bridge`,
    icon: WallerBannerLinkIcon,
    selectedIcon: WallerBannerLinkYellowIcon
  },
  fuseswap: {
    name: 'FuseSwap',
    path: '/fuseswap',
    url: (match) => `${match}/fuseswap`,
    icon: WallerBannerLinkIcon,
    selectedIcon: WallerBannerLinkYellowIcon
  }
}

const allPlugins = (isAdmin) => isAdmin
  ? ({
      bonuses: {
        name: 'Bonuses',
        path: '/bonuses',
        url: (match) => `${match}/bonuses`,
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
      },
      ...openPlugins
    })
  : openPlugins

export default allPlugins
