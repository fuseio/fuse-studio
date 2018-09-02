import React, { Component } from 'react'
import posed from 'react-pose'
import { isMobile } from 'react-device-detect'
import classNames from 'classnames'
import * as actions from 'actions/ui'

import { connect } from 'react-redux'
import CoinHeader from './CoinHeader'
import {getSelectedCommunity, getCommunities} from 'selectors/communities'
import find from 'lodash/find'
import sortBy from 'lodash/sortBy'
import ReactGA from 'services/ga'

const Sidebar = posed.div({
  open: {staggerChildren: 0, duration: 300},
  closed: {staggerChildren: 0, duration: 300}
})

const NavItem = posed.div({
  open: {damping: 0, staggerChildren: 0, x: 0, opacity: 1, duration: 700},
  closed: {damping: 0, staggerChildren: 0, x: 500, opacity: 0, duration: 100}
})

const CoinWrapper = posed.div({
  openCoinInfo: {damping: 0, staggerChildren: 0, height: '100vh', duration: 700, delay: 100},
  closedCoinInfo: {damping: 0, staggerChildren: 0, height: 'auto', duration: 300}
})

const Nav = ({ isOpen, coins, currentCoin, onClick, openCoinInfo, keyProp, setRef, fiat, loadModal }) => {
  let poseValue = isOpen ? 'open' : 'closed'
  let top = (keyProp) * 110 + (keyProp + 1) * 20
  let communityCoins = coins && coins.filter((coin) => {
    return coin.isLocalCurrency
  })
  const sidebarStyle = isMobile ? {} : {transform: openCoinInfo ? 'translateY(-' + top + 'px)' : 'none'}

  return (
    <Sidebar pose={poseValue} className='communities-list' style={sidebarStyle}>
      {communityCoins.map((coin, i) => {
        const coinWrapperStyle = classNames({
          'coin-wrapper': true,
          'open': openCoinInfo && keyProp === i
        })
        return <NavItem className='list-item' key={i} pose={isOpen ? 'open' : 'closed'} onClick={onClick.bind(this, coin.address, i)}>
          <CoinWrapper className={coinWrapperStyle} >
            <CoinHeader token={coin} fiat={fiat} loadModal={loadModal} />
          </CoinWrapper>
        </NavItem>
      }
      )}
    </Sidebar>)
}

class CommunitiesList extends Component {
  state = {
    active: false,
    openCoinInfo: false,
    key: 1,
    scrollLeft: 0,
    scrollOffset: 0
  }

  componentDidMount () {
    setTimeout(() => {
      this.setState({
        active: true
      })
    }, 500)
  }

  componentWillReceiveProps (nextProps) {
    if (isMobile && this.refs.CommunitiesList && !this.state.scrolling) {
      this.setState({
        scrolling: true
      })
      this.refs.CommunitiesList.addEventListener('scroll', this.handleScroll.bind(this))
    }
  }

  componentWillUnmount () {
    if (isMobile) this.refs.CommunitiesList && this.refs.CommunitiesList.removeEventListener('scroll', this.handleScrollRemove.bind(this))
  }

  handleScrollRemove (e) {
    e.stopPropagation()
    e.preventDefault()
  }

  handleScroll (e) {
    e.stopPropagation()
    e.preventDefault()
    this.setState({
      scrollLeft: e.target.scrollLeft
    })
  }
  onClick (item, key) {
    this.setState({
      item,
      key: key,
      scrollOffset: (key * 288) - this.state.scrollLeft
    })

    this.props.hideSignup(true)

    this.props.setActiveMarker(item)

    const selectedCommunity = find(this.props.tokens, {address: item})
    setTimeout(() => {
      this.props.history.push(selectedCommunity.path)
    }, 700)

    ReactGA.event({
      category: 'List',
      action: 'Click',
      label: selectedCommunity.name
    })
  }
  render () {
    const currentCoin = find(this.props.tokens, {address: this.state.item}) && this.props.ui.activeMarker
    const communityCoins = sortBy(this.props.tokens, 'name')

    if (this.props.tokens.length === 0) {
      return null
    }
    if (!isMobile) {
      return <Nav isOpen={this.state.active} coins={communityCoins} onClick={this.onClick.bind(this)} openCoinInfo={currentCoin} keyProp={this.state.key} fiat={this.props.fiat} loadModal={this.props.loadModal} />
    } else {
      const communitiesListStyle = classNames({
        'communities-list': true,
        'open-mobile': currentCoin
      })
      return <div className={communitiesListStyle} ref='CommunitiesList'>
        {communityCoins.map((coin, i) => {
          const coinWrapperStyle = classNames({
            'coin-wrapper': true,
            'open-mobile': currentCoin && this.state.key === i
          })
          return <div className='list-item' key={i} onClick={this.onClick.bind(this, coin.address, i)}>
            <div className={coinWrapperStyle} style={{transform: 'translateX(-' + (currentCoin ? this.state.scrollOffset : 0) + 'px)'}}>
              <CoinHeader token={coin} fiat={this.props.fiat} loadModal={this.props.loadModal} />
            </div>
          </div>
        })}
      </div>
    }
  }
};

const mapStateToProps = state => {
  return {
    tokens: getCommunities(state),
    ui: state.ui,
    selectedCommunity: getSelectedCommunity(state),
    fiat: state.fiat
  }
}

export default connect(
  mapStateToProps,
  actions
)(CommunitiesList)
