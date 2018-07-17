import React, { Component } from 'react'
import classNames from 'classnames'
import { formatAmountReal, formatMoney } from 'services/global'
import Loader from 'components/Loader'

export default class CoinHeader extends Component {
  render() {
    const formattedPrice = (this.props.price || this.props.price === 0) && formatMoney(formatAmountReal(this.props.price, 18), 4, '.', ',')
    return (
      <div className="coin-header">
        {this.props.coinImage ? <img src={this.props.coinImage} /> : <Loader class="loader image"/>}
        <div className="coin-details">
          <h1>{this.props.name || <Loader class="loader"/>}</h1>
          <div className="separator"/>
          <div className="price-wrapper">
            <h2>Current price:</h2>
            <p>{formattedPrice ? formattedPrice + ' CLN' : <Loader class="loader"/>}</p>
          </div>
        </div>
      </div>
    )
  }
}