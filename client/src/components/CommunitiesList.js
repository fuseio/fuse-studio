import React, { Component, Link } from "react"
import posed from 'react-pose'
import { mapStyle, googleMapsUrl } from '../constants/uiConstants'
import classNames from 'classnames'
import * as uiActions from '../actions/ui'
import { pagePath } from '../constants/uiConstants'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import CoinHeader from './CoinHeader'
import TlvCoin from 'images/tlv-coin.png'

const Sidebar = posed.div({
	open: { staggerChildren: 50, duration: 300 },
	closed: {  staggerChildren: 50, duration: 300},
})

const NavItem = posed.div({
	open: {  x: 0,  opacity: 1, duration: 100},
	closed: { x: 500, opacity: 0, duration: 100 },
})

const CoinWrapper = posed.div({
	openCoinInfo: { height: '100vh', duration: 700, delay: 100},
	closedCoinInfo: { height: 'auto', duration: 300 }
})

const Nav = ({ isOpen, coins, currentCoin, onClick, openCoinInfo, keyy }) => {
	let poseValue = isOpen ? 'open' : 'closed'
	let top = (keyy) * 110 + (keyy+1)*20
	return (
	<Sidebar pose={poseValue} className="communities-list" style={{transform: openCoinInfo ? 'translateY(-' + top + 'px)' : 'none'}}>
		{coins.map(((coin, i) => 
			<NavItem className="list-item" key={i} pose={isOpen ? 'open' : 'closed'} onClick={onClick.bind(this, coin.address, i)}>
				<CoinWrapper className="coin-wrapper" pose={openCoinInfo && keyy === i ? 'openCoinInfo' : 'closedCoinInfo'} >
					<CoinHeader coinImage={TlvCoin} name={coin.name} price={coin.currentPrice} />
				</CoinWrapper>
			</NavItem>
		))}
	</Sidebar>)
}

class CommunitiesList extends React.Component {
	state = {
		active: false,
		openCoinInfo: false,
		key: 1
	}

	componentDidMount() {
		setTimeout(() => {
			this.setState({
				active: true
			})
		}, 100)
	}
	onClick(item, key) {
		this.setState({
			key: key
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
		}, 500)
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

		return (
			Object.values(this.props.tokens) && Object.values(this.props.tokens).length ? 
			<Nav isOpen={this.state.active} coins={Object.values(this.props.tokens)} onClick={this.onClick.bind(this)} openCoinInfo={currentCoin} keyy={this.state.key}/> : null
		)
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
