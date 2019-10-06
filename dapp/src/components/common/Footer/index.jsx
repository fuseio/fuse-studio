import React from 'react'
import { withNetwork } from 'containers/Web3'
import capitalize from 'lodash/capitalize'
import classNames from 'classnames'
import { convertNetworkName } from 'utils/network'

const Footer = ({ networkType }) => {
  return (
    <div className='footer'>
      <div className='footer__item'>
        <span className={classNames('footer__status_dot', { 'footer__status_dot--on': networkType }, { 'footer__status_dot--off': !networkType })} />
        {networkType
          ? <span>Connected to {capitalize(convertNetworkName(networkType))} network</span>
          : <span>Not Connected</span>
        }
      </div>
      <div className='footer__item footer__item--last'>
        <span><a href='https://cdn.forms-content.sg-form.com/d81bb4fc-c732-11e9-a6f6-de5802169549' target='_blank' rel='noopener noreferrer'>Sign up for updates</a>&nbsp;|&nbsp;</span>
        <span>Fuse 2019&nbsp;|&nbsp;</span>
        <span style={{ fontWeight: 'bold' }}>BETA</span>
      </div>
    </div>
  )
}

export default withNetwork(Footer)
