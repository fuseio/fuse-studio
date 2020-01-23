import React from 'react'
import WalletBannerLinkForm from 'components/dashboard/components/WalletBannerLinkForm'
import { connect } from 'react-redux'
import { setWalletBannerLink } from 'actions/community'
import get from 'lodash/get'

const WalletBannerLink = ({
  community,
  setWalletBannerLink
}) => {
  return (
    community ? <div className='join_bonus__wrapper'>
      <div className='join_bonus'>
        <h2 className='join_bonus__main-title join_bonus__main-title--white'>Wallet banner link</h2>
        <div style={{ position: 'relative' }}>
          <WalletBannerLinkForm
            setWalletBannerLink={setWalletBannerLink}
            community={community}
            plugin={get(community, 'plugins.walletBanner', {})}
          />
        </div>
      </div>
    </div> : <div />
  )
}

const mapDispatchToState = {
  setWalletBannerLink
}

export default connect(null, mapDispatchToState)(WalletBannerLink)
