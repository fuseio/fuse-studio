import React, { Fragment } from 'react'
import WalletBannerLinkForm from 'components/dashboard/components/WalletBannerLinkForm'
import { connect } from 'react-redux'
import { setWalletBannerLink } from 'actions/community'
import get from 'lodash/get'

const WalletBannerLink = ({
  community,
  setWalletBannerLink
}) => {
  return (
    community ? <Fragment>
      <div className='join_bonus__header'>
        <h2 className='join_bonus__header__title'>Wallet banner link</h2>
      </div>
      <WalletBannerLinkForm
        setWalletBannerLink={setWalletBannerLink}
        community={community}
        plugin={get(community, 'plugins.walletBanner', {})}
      />
    </Fragment> : <div />
  )
}

const mapDispatchToState = {
  setWalletBannerLink
}

export default connect(null, mapDispatchToState)(WalletBannerLink)
