import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CommunityLogo from 'components/elements/CommunityLogo'
import FontAwesome from 'react-fontawesome'
import classNames from 'classnames'
import CopyToClipboard from 'components/common/CopyToClipboard'
import { formatWei } from 'utils/format'
import { getBlockExplorerUrl } from 'utils/network'
import { QR_MODAL } from 'constants/uiConstants'
import { checkImportedToken } from 'constants/existingTokens'
import { loadModal } from 'actions/ui'

const Step = ({ done, text, handleClick }) => (
  <div
    className={classNames('dashboard-progress-text', {
      'text-positive': done,
      'text-negative': !done
    })}
    onClick={done ? null : handleClick}
  >
    <FontAwesome name={classNames({ 'check': done, 'minus': !done })} />
    <span className='progress-text-content'>{text}</span>
  </div>
)

class TokenProgress extends Component {
  render () {
    const {
      token,
      networkType,
      tokenAddress,
      tokenNetworkType,
      metadata,
      steps,
      loadUserDataModal,
      loadBridgePopup,
      loadModal
    } = this.props
    const doneSteps = Object.values(steps).filter(step => step)
    const progressOverall = doneSteps.length * 20

    let importedAddress
    if (token && token.tokenType === 'imported') {
      const { value } = checkImportedToken(token, networkType)
      importedAddress = value
    }

    return (
      <div className='dashboard-sidebar'>
        <div className='logo'>
          <CommunityLogo
            isDaiToken={token && token.address === importedAddress}
            networkType={networkType}
            token={token}
            metadata={metadata[token.tokenURI] || {}}
          />
        </div>
        <div className='token-info'>
          <h5 className='token-info__title'>{token.name}</h5>
          <div className='token-info__total'><span>Total supply: {formatWei(token.totalSupply, 0)}</span><span>{token.symbol}</span></div>
          <div className='asset-id'>
            <span className='text'>Asset ID</span>
            <a href={`${getBlockExplorerUrl(tokenNetworkType)}/address/${tokenAddress}`}
              target='_blank'>
              <span className='id'>{tokenAddress.substring(0, 6)}...{tokenAddress.substr(tokenAddress.length - 4)}</span>
            </a>
            <CopyToClipboard text={tokenAddress}>
              <p className='dashboard-information-period'>
                <FontAwesome name='clone' />
              </p>
            </CopyToClipboard>
          </div>
          <hr className='line' />
        </div>
        <div className='dashboard-progress'>
          <div className={`dashboard-progress-bar-${progressOverall}`} />
          <div className='dashboard-progress-content'>
            <div className='dashboard-progress-title'>Overall progress</div>
            <div className='dashboard-progress-percent'>{progressOverall}%</div>
          </div>
        </div>
        <Step done
          text='Community token deployed' />
        <Step done handleClick={loadUserDataModal}
          text='Admin personal name given' />
        <Step done={steps.bridge} handleClick={loadBridgePopup}
          text='Bridge to Fuse - chain deployed' />
        <Step done={steps.community}
          text='Members list deployed' />
        <Step done={false} text='White label wallet paired' handleClick={() => loadModal(QR_MODAL, { value: tokenAddress })} />
      </div>
    )
  }
}

TokenProgress.propTypes = {
  token: PropTypes.object.isRequired
}

TokenProgress.defaultProps = {
  steps: {}
}

const mapDispatchToProps = {
  loadModal
}

export default connect(
  null,
  mapDispatchToProps
)(TokenProgress)
