import React, { Component } from 'react'
import classNames from 'classnames'
import * as actions from 'actions/ui'
import { connect } from 'react-redux'
import Community from './Community'
import {getCommunities, getMarketMaker} from 'selectors/communities'
import find from 'lodash/find'
import sortBy from 'lodash/sortBy'
import FontAwesome from 'react-fontawesome'

class CommunitiesList extends Component {
  state = {
    toggleFooter: false
  }

  render () {
    const currentCoin = find(this.props.tokens, {address: this.state.item}) && this.props.ui.activeMarker
    const communityCoins = sortBy(this.props.tokens, 'name')
    const currencyTokens = sortBy(this.props.marketMaker, 'tokenName')
    if (this.props.tokens.length === 0) {
      return null
    }
    const communitiesListStyle = classNames({
      'communities-list': true,
      'open-mobile': currentCoin
    })
    return <div className={communitiesListStyle} ref='CommunitiesList'>
      <h2 className='communities-list-title'>Communities</h2>
      <div className='communities-list-container'>
        {communityCoins.map((coin, i) => {
          const coinWrapperStyle = classNames({
            'coin-wrapper': true,
            'coin-show-footer': this.state.toggleFooter && this.state.activeCoin === i
          })
          return <div className='list-item' key={i} >
            <div className={coinWrapperStyle} onClick={() => this.setState({toggleFooter: true, activeCoin: i})}>
              { currencyTokens[i] && <Community
                token={coin}
                fiat={this.props.fiat}
                loadModal={this.props.loadModal}
                marketMaker={currencyTokens[i]}
              />
              }
            </div>
            <div className='coin-footer-close' onClick={() => this.setState({toggleFooter: false, activeCoin: ''})}>
              <FontAwesome name='times-circle' /> Close
            </div>
          </div>
        })}
      </div>
    </div>
  }
};

const mapStateToProps = state => {
  return {
    tokens: getCommunities(state),
    marketMaker: getMarketMaker(state),
    fiat: state.fiat
  }
}

export default connect(
  mapStateToProps,
  actions
)(CommunitiesList)
