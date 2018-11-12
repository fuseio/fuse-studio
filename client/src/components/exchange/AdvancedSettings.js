import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { BigNumber } from 'bignumber.js'
import trim from 'lodash/trim'

import {roundToWei} from './utils'
import DownArrow from 'images/down-arrow.png'
import TextInput from 'components/elements/TextInput'

const calculatePriceLimit = (pricePercentage, price, isBuy) => pricePercentage.plus(isBuy ? 1 : -1).absoluteValue()
  .multipliedBy(price)
const calculateMinimum = (pricePercentage, amountToReceive) => amountToReceive.div((pricePercentage.plus(1)))

const toPercentage = (value) => trim(value) === '' ? value : new BigNumber(value).multipliedBy(100).toString()

class AdvancedSettings extends Component {
  handlePricePercentage = (event) => {
    const value = event.target.value

    if (trim(value) === '') {
      this.nulliFySettings()
      return
    }

    const pricePercentage = new BigNumber(value).div(100)

    if (pricePercentage.isNaN()) {
      return
    }

    if (pricePercentage.isNegative()) {
      return
    }

    const minimum = calculateMinimum(pricePercentage, this.props.amountToReceive)
    const priceLimit = calculatePriceLimit(pricePercentage, this.props.price(), this.props.isBuy)

    this.props.setSettings({
      minimum: roundToWei(minimum).toString(),
      pricePercentage: pricePercentage.toString(),
      priceLimit: roundToWei(priceLimit).toString()
    })
  }

  handlePriceLimit = (event) => {
    const value = event.target.value
    if (trim(value) === '') {
      this.nulliFySettings()
      return
    }

    const priceLimit = new BigNumber(value)

    if (priceLimit.isNaN()) {
      return
    }

    if (priceLimit.isNegative()) {
      return
    }

    const pricePercentage = priceLimit.div(this.props.price()).minus(1)
    const minimum = calculateMinimum(pricePercentage, this.props.amountToReceive)

    this.props.setSettings({
      minimum: roundToWei(minimum).toString(),
      pricePercentage: roundToWei(pricePercentage).toString(),
      priceLimit: value
    })
  }

  handleMinimum = (event) => {
    const value = event.target.value
    if (trim(value) === '') {
      this.nulliFySettings()
      return
    }

    const minimum = new BigNumber(value)

    if (minimum.isNaN()) {
      return
    }

    if (minimum.isNegative()) {
      return
    }

    const pricePercentage = this.props.amountToReceive.div(minimum).minus(1)
    const priceLimit = calculatePriceLimit(pricePercentage, this.props.price())

    this.props.setSettings({
      minimum: value,
      pricePercentage: roundToWei(pricePercentage).toString(),
      priceLimit: roundToWei(priceLimit).toString()
    })
  }

  nulliFySettings = () => this.props.setSettings({
    minimum: '',
    pricePercentage: '',
    priceLimit: ''
  })

  componentWillReceiveProps (nextProps) {
    if (!this.props.amountToReceive.isEqualTo(nextProps.amountToReceive)) {
      if (trim(nextProps.pricePercentage) === '') {
        return
      }

      if (nextProps.amountToReceive.isEqualTo(0)) {
        this.props.setSettings({
          minimum: '',
          priceLimit: ''
        })
        return
      }
      const pricePercentage = new BigNumber(nextProps.pricePercentage)
      const minimum = calculateMinimum(pricePercentage, nextProps.amountToReceive)
      const priceLimit = calculatePriceLimit(pricePercentage, this.props.price(), nextProps.isBuy)

      this.props.setSettings({
        minimum: roundToWei(minimum).toString(),
        priceLimit: roundToWei(priceLimit).toString()
      })
    }
  }

  render = () => {
    const {isBuy} = this.props
    const {symbol} = this.props.community

    const advancedClass = classNames({
      'advanced-settings': true,
      'open': this.props.isOpen
    })

    return (
      <div className={advancedClass}>
        <div className='advanced-header' onClick={this.props.handleToggle}>
          <h5>Advanced settings</h5>
          <img src={DownArrow} />
        </div>
        <TextInput id='minimum'
          type='string'
          label='MINIMAL ACCEPTABLE AMOUNT'
          placeholder={`Enter minimal amount of ${isBuy ? symbol : 'CLN'}`}
          onChange={this.handleMinimum}
          value={this.props.minimum}
        />
        <div className='minimum-coin-symbol'>{isBuy ? symbol : 'CLN'}</div>
        <TextInput id='price-change'
          type='string'
          label={`${symbol} PRICE CHANGE`}
          placeholder='Enter price change in %'
          value={toPercentage(this.props.pricePercentage)}
          onChange={this.handlePricePercentage}
        />
        <div className='price-change-percent'>%</div>
        <TextInput id='price-limit'
          type='string'
          label={`${symbol} PRICE LIMIT`}
          placeholder={`Enter price limit for ${symbol}`}
          value={this.props.priceLimit}
          onChange={this.handlePriceLimit}
        />
        <div className='price-limit-cln'>CLN</div>
        <p className='annotation'>{`The transaction will fail if the price of 1 ${symbol} is ${(isBuy ? 'higher' : 'lower')} than ${(this.props.priceLimit)} CLN`}</p>
      </div>
    )
  }
}

AdvancedSettings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isBuy: PropTypes.bool.isRequired,
  community: PropTypes.object.isRequired,
  handleToggle: PropTypes.func.isRequired,
  minimum: PropTypes.string.isRequired,
  pricePercentage: PropTypes.string.isRequired,
  priceLimit: PropTypes.string.isRequired,
  amountToReceive: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  price: PropTypes.func.isRequired,
  setSettings: PropTypes.func.isRequired
}

export default AdvancedSettings
