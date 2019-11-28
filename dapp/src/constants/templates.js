import CommunityCurrencyLogo from 'images/community_currency_logo.svg'
import P2PLogo from 'images/p2p-icon.svg'
import P2PMarketPlace from 'images/p2p_marketPlace.png'
import P2PMarketPlace1 from 'images/p2p_marketPlace2x.png'
import P2PMarketPlace2 from 'images/p2p_marketPlace3x.png'
import CommunityCurrency from 'images/community_currency.png'
import CommunityCurrency1 from 'images/community_currency2x.png'
import LoyalyWallet from 'images/loyaly_wallet.png'
import LoyalyWallet2 from 'images/loyaly_wallet2x.png'
import LoyaltyWallet from 'images/loyalty-wallet.svg'
import P2PSide from 'images/wiz.png'
import LoyaltySide from 'images/fuse-app-home.png'
import sideImage from 'images/buy-screen.png'

export default [
  {
    title: 'Create P2P marketplace',
    hasSet: true,
    image: `${P2PMarketPlace} 300w, ${P2PMarketPlace1} 768w, ${P2PMarketPlace2} 1280w, ${P2PMarketPlace2} 3200w`,
    modalProps: {
      templateId: 1,
      logo: P2PLogo,
      sideImage: P2PSide,
      attributesTitle: 'The Community currency  consists of the following modules on Fuse:',
      text: 'The marketplace template lets you bring buyers and sellers to your marketplace and let’s them transact without a middlemen. Fuse lets you integrate dual currency and escrow contracts with real world marketplaces, to create a true P2P frictionless experience.',
      attributes: [
        'Issue your own mintable burnable token + stable coin',
        'Wallet',
        'Merchants and suppliers',
        'DAI integration',
        'Join Bonus'
      ]
    }
  },
  {
    title: 'Issue a community currency',
    hasSet: true,
    image: `${CommunityCurrency} 300w, ${CommunityCurrency1} 768w, ${CommunityCurrency1} 1280w, ${P2PMarketPlace2} 3200w`,
    modalProps: {
      templateId: 2,
      logo: CommunityCurrencyLogo,
      sideImage,
      attributesTitle: 'The Community currency  consists of the following modules on Fuse:',
      text: 'Issue your own ERC-20 community currency in Ethereum, integrate it to your wallet. Distribute the currency to your users and let them transfer it without friction. All using the Fuse wallet',
      attributes: [
        'Issue your own mintable burnable token',
        'Wallet',
        'Invite community admins',
        'Merchants and suppliers',
        'Join Bonus'
      ]
    }
  },
  {
    title: 'Create a loyalty wallet',
    hasSet: true,
    image: `${LoyalyWallet} 300w, ${LoyalyWallet2} 768w, ${LoyalyWallet2} 1280w, ${P2PMarketPlace2} 3200w`,
    modalProps: {
      templateId: 1,
      logo: LoyaltyWallet,
      sideImage: LoyaltySide,
      attributesTitle: 'The loyalty wallet template lets you launch a wallet that integrates DAI and allows your users to transfer DAI between each other and to merchants.',
      text: 'The loyalty wallet template lets you launch a wallet that integrates DAI and allows your users to transfer DAI between each other and to merchants.',
      attributes: [
        'Dai native currency',
        'Wallet',
        'Loyalty points',
        'Merchants and suppliers',
        'Join Bonus'
      ]
    }
  }
]
