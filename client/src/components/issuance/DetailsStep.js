import React, { Component } from 'react'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'
import Online from 'images/online.png'
import Geographical from 'images/geographical.png'
import PropTypes from 'prop-types'
import TextInput from 'components/elements/TextInput'

const totalSupplies = [1000000, 30000000, 65000000]

export default class DetailsStep extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showOtherSupply: false
    }
  }

  componentDidMount () {
    if (this.props.totalSupply !== '' && !totalSupplies.includes(this.props.totalSupply)) {
      this.setState({showOtherSupply: true})
    }
  }

  renderDetailsContent (communityType, setCommunityType, onlineImg, geoImg) {
    let detailsContent = []
    const communityTypes = [{'text': 'Online Community', 'img': onlineImg}, {'text': 'Local Community', 'img': geoImg}]
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
    const communityLogos = ['CoinIcon1.svg', 'CoinIcon2.svg', 'CoinIcon3.svg']
    communityLogos.forEach((logo, key) => {
      const totalSupplyClass = classNames({
        'step-content-details-type': true,
        'chosen-type': communityLogo && communityLogo.icon ? communityLogo.icon === logo : false
      })
      logoArr.push(
        <div className={totalSupplyClass} key={key} onClick={() => setCommunityLogo({ name: logo, icon: communityLogos[key] })}>
          <div className={`logo-img ${logo}`} />
          <span className='symbol-text'>{communitySymbol}</span>
        </div>
      )
    })
    return logoArr
  }

  checkCondition (evt, condition) {
    if (condition) {
      evt.preventDefault()
    }
  }

  clearSupply () {
    this.props.setTotalSupply('')
    this.setState({showOtherSupply: false})
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
                  onKeyDown={(evt) => this.checkCondition(evt, (evt.key === 'e' || evt.key === '-'))}
                  onChange={(event) => this.props.setTotalSupply(event.target.value)}
                />
                <div className='other-details' onClick={() => this.clearSupply()}>
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
              Object.keys(this.props.communityType).length === 0 || this.props.totalSupply < 0 || this.props.totalSupply === '0' || !this.props.totalSupply || !this.props.communityLogo.name
            }
            onClick={this.props.setNextStep}
          >
            Continue
            <FontAwesome className='symbol-icon' name='angle-right' />
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
