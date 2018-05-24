import React, { Component, Link } from "react"
import posed from 'react-pose'
import { isBrowser, isMobile } from "react-device-detect"
import { mapStyle, googleMapsUrl } from 'constants/uiConstants'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { pagePath } from 'constants/uiConstants'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import CoinHeader from './CoinHeader'
import TlvCoin from 'images/tlv-coin.png'

const Sidebar = posed.div({
	open: { staggerChildren: 50, duration: 300 },
	closed: {  staggerChildren: 50, duration: 300},
})

const NavItem = posed.div({
	open: {  x: 0,  opacity: 1, duration: 1000},
	closed: { x: 500, opacity: 0, duration: 100 },
})

const CoinWrapper = posed.div({
	openCoinInfo: { height: '100vh', duration: 1000, delay: 100},
	closedCoinInfo: { height: 'auto', duration: 300 }
})

const Nav = ({ isOpen, coins, currentCoin, onClick, openCoinInfo, keyy, setRef }) => {
	let poseValue = isOpen ? 'open' : 'closed'
	let top = (keyy) * 110 + (keyy+1)*20
	let communityCoins = coins && coins.filter((coin) => {
		return coin.isLocalCurrency
	})
	const sidebarStyle = isMobile ? {} : {transform: openCoinInfo ? 'translateY(-' + top + 'px)' : 'none'}
	
	return (
	<Sidebar pose={poseValue} className="communities-list" style={sidebarStyle}>
		{communityCoins.map(((coin, i) => {
			const coinWrapperStyle = classNames({
				"coin-wrapper": true,
				"open-mobile": isMobile && openCoinInfo && keyy === i
			})
			return <NavItem className="list-item" key={i} pose={isOpen ? 'open' : 'closed'} onClick={onClick.bind(this, coin.address, i)}>
				<CoinWrapper className={coinWrapperStyle} pose={openCoinInfo && keyy === i ? 'openCoinInfo' : 'closedCoinInfo'} >
					<CoinHeader coinImage={TlvCoin} name={coin.name} price={coin.currentPrice} />
				</CoinWrapper>
			</NavItem>
		}
		))}
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

	componentDidMount() {
		setTimeout(() => {
			this.setState({
				active: true
			})
		}, 500)

		
		if (isMobile) this.refs.CommunitiesList.addEventListener('scroll', this.handleScroll.bind(this))
	}

	componentWillUnmount() {
		if (isMobile) this.refs.CommunitiesList.removeEventListener('scroll', this.handleScrollRemove.bind(this))
	}
	
	handleScrollRemove(e) {
		e.stopPropagation()
		e.preventDefault()
	}

	handleScroll(e) {
		this.setState({
			scrollLeft: e.target.scrollLeft
		})
	}
	onClick(item, key) {
		this.setState({
			key: key,
			scrollOffset: (key * 288) - this.state.scrollLeft
		})

		let n = 5

		this.props.uiActions.zoomToMarker(n)
		setTimeout(() => {this.props.uiActions.zoomToMarker(n + 1)}, 150)
		setTimeout(() => {this.props.uiActions.zoomToMarker(n + 2)}, 300)
		setTimeout(() => {this.props.uiActions.zoomToMarker(n + 3)}, 450)
		
		this.props.uiActions.setActiveMarker(item)

		let path
		pagePath && Object.values(pagePath) && Object.values(pagePath).forEach((page) => {
			if (page.address === item) {
				path = page.path
				return
			}
		})
		setTimeout(() => {
			this.props.history.push(path)
		}, 1500)
	}
	render() {
		let currentCoinAdress
		pagePath && Object.values(pagePath) && Object.values(pagePath).forEach((page) => {
			if (page && page.path === this.props.history.location.pathname) {
				currentCoinAdress = page.address
				return
			}
		})
		const currentCoin = (this.props.tokens && this.props.ui && this.props.ui.activeMarker && this.props.tokens[this.props.ui.activeMarker]) 
							|| (this.props.tokens && this.props.tokens[currentCoinAdress]) || null
		const communityCoins = Object.values(this.props.tokens) && Object.values(this.props.tokens).filter((coin) => {
			return coin.isLocalCurrency
		})
		
		if (Object.values(this.props.tokens) && Object.values(this.props.tokens).length && !isMobile) {
			return <Nav isOpen={this.state.active} coins={Object.values(this.props.tokens)} onClick={this.onClick.bind(this)} openCoinInfo={currentCoin} keyy={this.state.key}/>
		} else if (Object.values(this.props.tokens) && Object.values(this.props.tokens).length && isMobile) {
			return <div className="communities-list" ref="CommunitiesList">
				{communityCoins.map(((coin, i) => {
					const coinWrapperStyle = classNames({
						"coin-wrapper": true,
						"open-mobile": currentCoin && this.state.key === i
					})
					return <div className="list-item" key={i} style={{transform: 'translateX(-' + (currentCoin ? this.state.scrollOffset : 0) + 'px)'}} onClick={this.onClick.bind(this, coin.address, i)}>
						<div className={coinWrapperStyle}>
							<CoinHeader coinImage={TlvCoin} name={coin.name} price={coin.currentPrice} />
						</div>
					</div>
				}))}
			</div>
		} else {
			return null
		}
	}
};

const mapStateToProps = state => {
	return {
		tokens: state.tokens,
		ui: state.ui
	}
}

const mapDispatchToProps = dispatch => {
    return {
        uiActions: bindActionCreators(uiActions, dispatch),
    }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(CommunitiesList)
