import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import QRCode from 'qrcode.react'

import InviteForm from 'components/dashboard/components/InviteForm'

import { getCurrentCommunity } from 'selectors/dashboard'
import { getHomeTokenByCommunityAddress } from 'selectors/token'
import { getCommunityAddress } from 'selectors/entities'

import AppleDownload from 'images/apple.svg'
import GoogleDownload from 'images/google-play.svg'

const WhiteLabelWallet = ({ value, communityAddress }) => {
  return (
    value && <Fragment>
      <div className='qr-code__header'>
        <h2 className='qr-code__header__title'>White label wallet</h2>
      </div>
      <div className='qr-code__wrapper'>
        <div className='qr-code'>
          <div className='qr-code__main'>
            <ol className='qr-code__steps'>
              <li>Please download the Fuse wallet from Google play/Apple <br />app store by clicking on this <a target='_blank' rel='noopener noreferrer' href='http://fuseio.app.link/PKSgcxA6KZ'>link</a>
                <div className='qr-code__download grid-x align-middle'>
                  <a href='https://apps.apple.com/il/app/fuse-wallet/id1491783654' target='_blank' rel='noopener noreferrer'><img src={AppleDownload} /></a>
                  <a href='https://play.google.com/store/apps/details?id=io.fuse.fusecash' target='_blank'><img src={GoogleDownload} /></a>
                </div>
              </li>
              <li>Sign up to the app</li>
              <li>Open the left menu and choose "switch community"</li>
              <li>Scan this QR code to switch to the community you created!</li>
            </ol>
            <div className='qr-code__image'>
              <QRCode size={150} value={value} />
            </div>
          </div>
          <div className='qr-code__desc'>
            The Fuse wallet is open source and white label - more technical information on our <a target='_blank' href='https://github.com/fuseio/fuse-wallet'>Github</a>
          </div>
        </div>
      </div>
      <InviteForm communityAddress={communityAddress} />
    </Fragment>
  )
}

const mapState = (state) => ({
  communityAddress: getCommunityAddress(state),
  community: getCurrentCommunity(state, getCommunityAddress(state)),
  homeToken: getHomeTokenByCommunityAddress(state, getCommunityAddress(state)) || { owner: '' }
})

export default connect(mapState, null)(WhiteLabelWallet)
