import React, { Component } from 'react'
import classNames from 'classnames'
import { formatAmountReal, formatMoney } from 'services/global'

export default class CoinHeader extends Component {
  render() {
    const formattedPrice = this.props.price || this.props.price === 0 ? formatMoney(formatAmountReal(this.props.price, 18), 4, '.', ',') : 'loading'
    return (
      <div className="coin-header">
        <img src={this.props.coinImage} />
        <div className="coin-details">
          <h1>{this.props.name}</h1>
          <div className="separator"/>
          <div className="price-wrapper">
            <h2>Current price:</h2>
            <p>{formattedPrice + ' CLN'}</p>
          </div>
        </div>
      </div>
    )
  }
}