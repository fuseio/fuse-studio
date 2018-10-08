import React, { Component } from 'react'
import classNames from 'classnames'
import Online from 'images/Online.svg'
import Geographical from 'images/Geographical.svg'
import PropTypes from 'prop-types'
import CoinIcon1 from 'images/Coin1.svg'
import CoinIcon2 from 'images/Coin2.svg'
import CoinIcon3 from 'images/Coin3.svg'
import TextInput from './../TextInput'

export default class DetailsStep extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showOtherSupply: false
    }
  }

  renderDetailsContent (communityType, setCommunityType, onlineImg, geoImg) {
    let detailsContent = []
    const communityTypes = [{'text': 'Online', 'img': onlineImg}, {'text': 'Geographical', 'img': geoImg}]
    communityTypes.forEach((item, key) => {
      const stepDetailsClass = classNames({
        'step-content-details-type': true,
        'chosen-type': communityType.text === item.text
      })
      detailsContent.push(
        <div
          className={stepDetailsClass}
          key={key}
          onClick={() => setCommunityType(communityTypes[key])}
        >
          <img src={item.img} className='type-img' />
          {item.text}
        </div>
      )
    })
    return detailsContent
  }

  renderTotalContent (totalSupply, setTotalSupply) {
    let totalContent = []
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0
    })
    const totalSupplies = [1000000, 30000000, 65000000]
    totalSupplies.forEach((item, key) => {
      const totalSupplyClass = classNames({
        'step-content-details-type': true,
        'number-type': true,
        'chosen-type': totalSupply === item
      })
      totalContent.push(
        <div
          className={totalSupplyClass}
          key={key}
          onClick={() => setTotalSupply(totalSupplies[key])}
        >
          {formatter.format(item)}
        </div>
      )
    })
    return totalContent
  }

  renderLogo (communityLogo, setCommunityLogo, communitySymbol) {
    let logoArr = []
    const communityLogos = {
      CoinIcon1: CoinIcon1,
      CoinIcon2: CoinIcon2,
      CoinIcon3: CoinIcon3
    }
    Object.keys(communityLogos).forEach((key) => {
      const totalSupplyClass = classNames({
        'step-content-details-type': true,
        'chosen-type': communityLogo && communityLogo.icon ? communityLogo.icon === communityLogos[key] : false
      })
      logoArr.push(
        <div className={totalSupplyClass} key={key} onClick={() => setCommunityLogo({ name: key + '.svg', icon: communityLogos[key] })}>
          <img src={communityLogos[key]} className='logo-img' />
          <span className='symbol-text'>{communitySymbol}</span>
        </div>
      )
    })
    return logoArr
  }

  render () {
    return (
      <div className='step-content-details'>
        <div className='step-content-details-block'>
          <h3 className='step-content-details-title'>
            Community Type
          </h3>
          <div className='step-content-details-container'>
            {this.renderDetailsContent(this.props.communityType, this.props.setCommunityType, Online, Geographical)}
          </div>
        </div>
        <div className='step-content-details-block'>
          <h3 className='step-content-details-title'>
            Community Logo
          </h3>
          <div className='step-content-details-container'>
            {this.renderLogo(this.props.communityLogo, this.props.setCommunityLogo, this.props.communitySymbol)}
          </div>
        </div>
        <div className='step-content-details-block total-block'>
          <h3 className='step-content-details-title'>
            Total CC Supply
          </h3>
          <div className='step-content-details-container total-container'>
            {this.state.showOtherSupply
              ? <div className='step-content-details-supply'>
                <TextInput
                  className='step-community-name'
                  id='communityName'
                  type='number'
                  placeholder='Type something...'
                  value={this.props.totalSupply}
                  onChange={(event) => this.props.setTotalSupply(event.target.value)}
                />
                <div className='other-details' onClick={() => this.setState({showOtherSupply: false})}>
                  Cancel
                </div>
              </div>
              : this.renderTotalContent(this.props.totalSupply, this.props.setTotalSupply)}
            {!this.state.showOtherSupply &&
              <div className='other-details' onClick={() => this.setState({showOtherSupply: !this.state.showOtherSupply})}>
                Other
              </div>
            }
          </div>
        </div>
        <div className='text-center'>
          <button
            className='symbol-btn'
            disabled={
              Object.keys(this.props.communityType).length === 0 || !this.props.totalSupply || !this.props.communityLogo
            }
            onClick={this.props.setNextStep}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }
}

DetailsStep.propTypes = {
  communityType: PropTypes.object,
  setCommunityType: PropTypes.func.isRequired,
  communityName: PropTypes.string,
  totalSupply: PropTypes.any,
  setTotalSupply: PropTypes.func.isRequired,
  communityLogo: PropTypes.object,
  communitySymbol: PropTypes.string,
  setCommunityLogo: PropTypes.func.isRequired,
  setNextStep: PropTypes.func.isRequired
}
