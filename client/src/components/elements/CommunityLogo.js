import React from 'react'
import PropTypes from 'prop-types'
import CoinImage from 'images/Coin2.svg'

const CommunityLogo = (props) => (
  <div className='coin-logo'>
    <img src={CoinImage} className='logo-img' />
    <span className='symbol-text'>{props.token.symbol}</span>
  </div>
)

CommunityLogo.propTypes = {
  token: PropTypes.object.isRequired
}

export default CommunityLogo
