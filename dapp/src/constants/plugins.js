import DollarIcon from 'images/fiat-on-ramp-white.svg'
import DollarYellowIcon from 'images/fiat-on-ramp-selected.svg'
import JoinBonusIcon from 'images/join_bonus.svg'
import JoinBonusYellowIcon from 'images/join_bonus_selected.svg'
import BusinessIcon from 'images/business_list.svg'
import BusinessYellowIcon from 'images/business_list_yellow.svg'
import WallerBannerLinkIcon from 'images/wallet-banner-link.svg'
import WallerBannerLinkYellowIcon from 'images/wallet-banner-link-selected.svg'
import JoinBonus from 'images/join_bonus.png'
import JoinBonusBig from 'images/join_bonus_big.png'
import BusinessList from 'images/business_list.png'
import BusinessListBig from 'images/business_list_big.png'
import FiatOnRamp from 'images/fiat-on-ramp.png'
import FiatOnRampBig from 'images/fiat-on-ramp-big.png'
import WalletBannerLink from 'images/wallet_banner_link.png'
import WalletBannerLinkBig from 'images/wallet_banner_link_big.png'
import BridgePlugin from 'images/bridge_plugin.png'
import BridgePluginBig from 'images/bridge_plugin_big.png'
import FuseswapPlugin from 'images/fuseswap_plugin.png'
import FuseswapPluginBig from 'images/fuseswap_plugin_big.png'

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

export const generalPlugins = ([
  {
    title: 'Business list',
    coverImage: BusinessList,
    modalCoverPhoto: BusinessListBig,
    key: 'businessList',
    content: 'The business list allows to you integrate new businesses into your economy. Once a business is added they will appear in the mobile wallet and users will be able to transact with them freely.'
  },
  {
    title: 'Wallet banner link',
    coverImage: WalletBannerLink,
    disabled: false,
    modalCoverPhoto: WalletBannerLinkBig,
    content: 'The wallet banner plug-in allows you to customize your wallet by adding an image and hyperlink of your choice to your wallet.',
    key: 'walletBanner'
  },
  {
    title: 'Bonuses',
    coverImage: JoinBonus,
    modalCoverPhoto: JoinBonusBig,
    key: 'bonuses',
    content: 'This plugin gives you the ability to reward users for completing multiple different actions. Join your economy, invite their friends or backup their wallet are all actions that can be rewarded with tokens.'
  },
  {
    title: 'Fiat on ramp',
    coverImage: FiatOnRamp,
    disabled: false,
    modalCoverPhoto: FiatOnRampBig,
    content: `We have created integration with Moonpay, Transak, fiat gateways that allow you to embed the relevant payment option
      (credit/debit cards and banks wires) inside your app and even show several option for your clients to choose from.
      The integration allows your users to top their account without you holding any custody in the process! Here is how:
      https://www.youtube.com/watch?v=ShxUIljvfLU&feature=emb_title`,
    key: 'onramp'
  },
  {
    title: 'Ethereum bridge',
    coverImage: BridgePlugin,
    disabled: false,
    modalCoverPhoto: BridgePluginBig,
    content: `We have created integration with Moonpay, Transak, fiat gateways that allow you to embed the relevant payment option
      (credit/debit cards and banks wires) inside your app and even show several option for your clients to choose from.
      The integration allows your users to top their account without you holding any custody in the process! Here is how:
      https://www.youtube.com/watch?v=ShxUIljvfLU&feature=emb_title`,
    key: 'bridge'
  },
  {
    title: 'Create Fuseswap pool',
    coverImage: FuseswapPlugin,
    disabled: false,
    modalCoverPhoto: BridgePluginBig,
    content: `Fuseswap is a decentralized exchange that allows anybody with tokens on Fuse to trade their tokens against a
     smart contract that is managing a liquidity pool. It allows for users of the Studio that create a currency, to create a
      liquidity pool on Fuseswap and let others trade this coin. In order to create the pool, please go to the following
       link and add your token along with another currency so the pair can have an exchange rate. You can read more about
        adding liquidity on the docs Please click here to set up your liquidity pool.`,
    key: 'fuseswap'
  }
])
