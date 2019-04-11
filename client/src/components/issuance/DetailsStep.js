import React, { Component } from 'react'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'
import MintableBurnable from 'images/mintable.svg'
import OneTimeIssuer from 'images/one_time_issuer_token.svg'
import PropTypes from 'prop-types'
import TextInput from 'components/elements/TextInput'

export default class DetailsStep extends Component {

  renderDetailsContent (communityType, setCommunityType) {
    const communityTypes = [{ 'text': 'Mintable burnable token', 'img': MintableBurnable }, { 'text': 'One time issuer token', 'img': OneTimeIssuer }]

    const detailsContent = communityTypes.map(({ text, img }, key) => {
      const stepDetailsClass = classNames({
        'step-content-details-logo': true,
        'chosen-type': communityType.text === text
      })

      return (
        <div className={stepDetailsClass} key={key} onClick={() => setCommunityType(communityTypes[key])}>
          <img src={img} className='type-img' />
          <span className='step-content-details-logo-text'>{text}</span>
        </div>
      )
    })
    return detailsContent
  }

  renderLogo (communityLogo, setCommunityLogo, communitySymbol) {
    const communityLogos = ['CoinIcon1.svg', 'CoinIcon2.svg', 'CoinIcon3.svg']

    const logoArr = communityLogos.map((logo, key) => {
      const totalSupplyClass = classNames({
        'step-content-details-type': true,
        'chosen-type': communityLogo && communityLogo.icon ? communityLogo.icon === logo : false
      })
      return (
        <div className={totalSupplyClass} key={key} onClick={() => setCommunityLogo({ name: logo, icon: communityLogos[key] })}>
          <div className={`logo-circle__outer logo-circle__outer--big logo-circle__outer--${logo}`}>
            <div className='logo-circle__inner logo-circle__inner--big' />
            <span className='logo-circle__name'>{communitySymbol}</span>
          </div>
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

  render () {
    return (
      <div className='step-content-details'>
        <div className='step-content-details-block'>
          <h3 className='step-content-details-title'>
            Currency Type
          </h3>
          <div className='step-content-details-container'>
            {this.renderDetailsContent(this.props.communityType, this.props.setCommunityType)}
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
        <div className='step-content-details-block'>
          <h3 className='step-content-details-title'>
            Initial / Total Supply
          </h3>
          <div className='step-content-details-container total-container'>
            <TextInput
              className='step-community-name-total'
              id='communityName'
              type='number'
              placeholder='22,000'
              value={this.props.totalSupply}
              onKeyDown={(evt) => this.checkCondition(evt, (evt.key === 'e' || evt.key === '-'))}
              onChange={(event) => this.props.setTotalSupply(event.target.value)}
            />
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
