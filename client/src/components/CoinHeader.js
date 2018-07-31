import React, { Component } from 'react'
import { formatAmountReal, formatMoney } from 'services/global'
import Loader from 'components/Loader'

export default class CoinHeader extends Component {
  render () {
    const { price, coinImage, name } = this.props
    const formattedPrice = (price || price === 0) && formatMoney(formatAmountReal(price, 18), 4, '.', ',')
    return (
      <div className='coin-header'>
        {coinImage ? <img src={coinImage} /> : <Loader className='loader image' />}
        <div className='coin-details'>
          <h1>{name || <Loader className='loader' />}</h1>
          <div className='separator' />
          <div className='price-wrapper'>
            <h2>Current price:</h2>
            <p>{formattedPrice ? formattedPrice + ' CLN' : <Loader className='loader' />}</p>
          </div>
        </div>
      </div>
    )
  }
}
