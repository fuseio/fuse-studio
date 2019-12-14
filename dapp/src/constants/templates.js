import React from 'react'
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
import P2PSide from 'images/farmers-market.png'
import LoyaltySide from 'images/malta-community.png'
import sideImage from 'images/wheels4u-community page.png'

export default [
  {
    title: 'Create P2P marketplace',
    Image: () => (
      <img alt='cover photo' sizes='(max-width:800px) 30vw,  600px'
        srcSet={`${P2PMarketPlace} 300w, ${P2PMarketPlace1} 768w, ${P2PMarketPlace2} 1280w, ${P2PMarketPlace2} 3200w`} />
    ),
    modalProps: {
      templateId: 1,
      logo: P2PLogo,
      sideImage: P2PSide,
      attributesTitle: 'The Community currency  consists of the following modules on Fuse:',
      Text: () => (
        <div className='text'>
          The marketplace template lets you bring buyers and sellers to your marketplace and let’s them transact without a middlemen. Fuse lets you integrate dual currency and escrow contracts with real world marketplaces, to create a true P2P frictionless experience.
        </div>
      ),
      attributes: [
        'Issue your own mintable burnable token',
        'Stable coin',
        'Custom Wallet',
        'Business list',
        'Join Bonus'
      ]
    }
  },
  {
    title: 'Issue a community currency',
    Image: () => (
      <img alt='cover photo' sizes='(max-width:800px) 30vw,  600px' 
        srcSet={`${CommunityCurrency} 300w, ${CommunityCurrency1} 768w, ${CommunityCurrency1} 1280w, ${CommunityCurrency1} 3200w`} />
    ),
    modalProps: {
      templateId: 2,
      logo: CommunityCurrencyLogo,
      sideImage,
      attributesTitle: 'The Community currency  consists of the following modules on Fuse:',
      Text: () => (
        <div className='text'>
          Issue your own ERC-20 community currency in Ethereum, <br />
          integrate it to your wallet. Distribute the currency to your users <br />
          and let them transfer it without friction. All using the Fuse wallet
        </div>
      ),
      attributes: [
        'Issue your own mintable burnable token',
        'Custom Wallet',
        'Invite community admins',
        'Business list',
        'Join Bonus'
      ]
    }
  },
  {
    title: 'Create a loyalty wallet',
    Image: () => (
      <img alt='cover photo' sizes='(max-width:800px) 30vw,  600px'
        srcSet={`${LoyalyWallet} 300w, ${LoyalyWallet2} 768w, ${LoyalyWallet2} 1280w, ${LoyalyWallet2} 3200w`} />
    ),
    modalProps: {
      templateId: 1,
      logo: LoyaltyWallet,
      sideImage: LoyaltySide,
      attributesTitle: 'The loyalty wallet template lets you launch a wallet that integrates DAI and allows your users to transfer DAI between each other and to merchants.',
      Text: () => (
        <div className='text'>
          The loyalty wallet template lets you launch a wallet that integrates <br />
          DAI and allows your users to transfer DAI between each other and<br /> to merchants.
        </div>
      ),
      attributes: [
        'DAI stable coin',
        'Loyalty points',
        'Custom Wallet',
        'Business list',
        'Join Bonus'
      ]
    }
  }
]
