import React, { Component, Link } from "react"
import posed from 'react-pose'
import { isBrowser, isMobile, isIOS, isChrome } from 'react-device-detect'
import { mapStyle, googleMapsUrl } from 'constants/uiConstants'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import CoinHeader from './CoinHeader'
import {getSelectedCommunity, getCommunities} from 'selectors/basicToken'
import find from 'lodash/find'
import ReactGA from 'services/ga'

const Sidebar = posed.div({
	open: { staggerChildren: 0, duration: 300 },
	closed: {  staggerChildren: 0, duration: 300},
})

const NavItem = posed.div({
	open: {  damping: 0, staggerChildren: 0, x: 0,  opacity: 1, duration: 700},
	closed: { damping: 0, staggerChildren: 0, x: 500, opacity: 0, duration: 100 },
})

const CoinWrapper = posed.div({
	openCoinInfo: { damping: 0, staggerChildren: 0, height: '100vh', duration: 700, delay: 100},
	closedCoinInfo: { damping: 0, staggerChildren: 0,height: 'auto', duration: 300 }
})

const Nav = ({ isOpen, coins, currentCoin, onClick, openCoinInfo, key, setRef }) => {
	let poseValue = isOpen ? 'open' : 'closed'
	let top = (key) * 110 + (key+1)*20
	let communityCoins = coins && coins.filter((coin) => {
		return coin.isLocalCurrency
	})
	const sidebarStyle = isMobile ? {} : {transform: openCoinInfo ? 'translateY(-' + top + 'px)' : 'none'}

	return (
	<Sidebar pose={poseValue} className="communities-list" style={sidebarStyle}>
		{communityCoins.map(((coin, i) => {
			const coinWrapperStyle = classNames({
				"coin-wrapper": true,
				"open": openCoinInfo && key === i
			})
			return <NavItem className="list-item" key={i} pose={isOpen ? 'open' : 'closed'} onClick={onClick.bind(this, coin.address, i)}>
				<CoinWrapper className={coinWrapperStyle} >
					<CoinHeader coinImage={coin.metadata && coin.metadata.imageLink} name={coin.name} price={coin.currentPrice} />
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
	}

	componentWillReceiveProps(nextProps) {
		if (isMobile && this.refs.CommunitiesList && !this.state.scrolling) {
			this.setState({
				scrolling: true
			})
			this.refs.CommunitiesList.addEventListener('scroll', this.handleScroll.bind(this))
		}
	}

	componentWillUnmount() {
		if (isMobile) this.refs.CommunitiesList && this.refs.CommunitiesList.removeEventListener('scroll', this.handleScrollRemove.bind(this))
	}

	handleScrollRemove(e) {
		e.stopPropagation()
		e.preventDefault()
	}

	handleScroll(e) {
		e.stopPropagation()
		e.preventDefault()
		this.setState({
			scrollLeft: e.target.scrollLeft
		})
	}
	onClick(item, key) {
		this.setState({
			item,
			key: key,
			scrollOffset: (key * 288) - this.state.scrollLeft
		})

		let n = 5

		this.props.uiActions.hideSignup(true)

		this.props.uiActions.setActiveMarker(item)

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
	render() {
		const currentCoin = find(this.props.tokens, {address: this.state.item}) && this.props.ui.activeMarker

		const communityCoins = Object.values(this.props.tokens) && Object.values(this.props.tokens).filter((coin) => {
			return coin.isLocalCurrency
		})

		if (Object.values(this.props.tokens) && Object.values(this.props.tokens).length && !isMobile) {
			return <Nav isOpen={this.state.active} coins={Object.values(this.props.tokens)} onClick={this.onClick.bind(this)} openCoinInfo={currentCoin} key={this.state.key} />
		} else if (Object.values(this.props.tokens) && Object.values(this.props.tokens).length && isMobile) {
			const communitiesListStyle = classNames({
				"communities-list": true,
				"open-mobile": currentCoin
			})
			return <div className={communitiesListStyle} ref="CommunitiesList">
				{communityCoins.map(((coin, i) => {
					const coinWrapperStyle = classNames({
						"coin-wrapper": true,
						"open-mobile": currentCoin && this.state.key === i
					})
					return <div className="list-item" key={i}  onClick={this.onClick.bind(this, coin.address, i)}>
						<div className={coinWrapperStyle} style={{transform: 'translateX(-' + (currentCoin ? this.state.scrollOffset : 0) + 'px)'}}>
							<CoinHeader coinImage={coin.metadata && coin.metadata.imageLink} name={coin.name} price={coin.currentPrice} />
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
		tokens: getCommunities(state),
		ui: state.ui,
		selectedCommunity: getSelectedCommunity(state)
	}
}

const mapDispatchToProps = dispatch => {
    return {
        uiActions: bindActionCreators(uiActions, dispatch)
    }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(CommunitiesList)
