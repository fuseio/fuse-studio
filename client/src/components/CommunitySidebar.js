import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Link from 'react-router-dom/Link'
import { isBrowser, isMobile } from "react-device-detect"
import classNames from 'classnames'
import * as uiActions from '../actions/ui'
import { pagePath } from '../constants/uiConstants'

import TlvCoin from 'images/tlv-coin.png'

import CoinHeader from './CoinHeader'

class CommunitySidebar extends Component {
	state = {
		pos: {y: 0},
    	dragging: false,
    	rel: null
	}
	componentDidMount() {

	}

	componentWillUnmount() {
		this.refs.bar.removeEventListener('touchmove', this.onMouseMove.bind(this))
		this.refs.bar.removeEventListener('touchend', this.onMouseUp.bind(this))
	}

	componentDidUpdate(props, state) {
		if (this.state.dragging && !state.dragging) {
			this.refs.bar.addEventListener('touchmove', this.onMouseMove.bind(this))
			this.refs.bar.addEventListener('touchend', this.onMouseUp.bind(this))
		} else if (!this.state.dragging && state.dragging) {
			this.refs.bar.removeEventListener('touchmove', this.onMouseMove.bind(this))
			this.refs.bar.removeEventListener('touchend', this.onMouseUp.bind(this))
		}
	}

	onMouseDown(e) {
		var posTop = this.refs.bar.offsetTop
		this.setState({
			dragging: true,
			open: false,
			closed: false,
			pos: {y: 0},
			rel: { y: e.touches[0].pageY - posTop }
		})
		
		e.stopPropagation()
		e.preventDefault()
	}
	onMouseUp(e) {
		if (this.state.open) {
			this.refs.bar.removeEventListener('touchmove', this.onMouseMove.bind(this))
			this.refs.bar.removeEventListener('touchend', this.onMouseUp.bind(this))
			return
		}
		this.setState({
			dragging: false,
			open: this.state.pos.y < -80 ? true : false,
			closed: this.state.pos.y >= -80 ? true : false,
		})
		e.stopPropagation()
		e.preventDefault()
	}
	onMouseMove(e) {
		if (!this.state.dragging) return
		this.setState({
			pos: { y: e.touches[0].pageY - this.state.rel.y }
		})
		e.stopPropagation()
		e.preventDefault()
	}
	onBackMobile() {
		this.setState({
			closed: true,
			open: false
		})
	}
	onClose() {
		let n = 7
		this.props.uiActions.zoomToMarker(n)
		setTimeout(() => {this.props.uiActions.zoomToMarker(n - 1)}, 250)
		setTimeout(() => {this.props.uiActions.zoomToMarker(n - 2)}, 400)
		setTimeout(() => {this.props.uiActions.zoomToMarker(n - 3)}, 550)
		this.props.uiActions.setActiveMarker()
	}
	render() {
		let currentCoinAdress
		pagePath && Object.values(pagePath) && Object.values(pagePath).forEach((page) => {
			if (page.path === this.props.match.path) {
				currentCoinAdress = page.address
				return
			}

		})
		let communitySidebarClass = classNames({
			"community-sidebar": true,
		})

		let topPosition

		if (this.state.open) {
			topPosition = 'calc(-100vh + 100px)'
		} else if (this.state.closed) {
			topPosition = '0px'
		} else {
			topPosition =  this.state.pos.y + 'px'
		}

		const currentCoin = (this.props.tokens && this.props.ui && this.props.ui.activeMarker && this.props.tokens[this.props.ui.activeMarker]) 
							|| (this.props.tokens && this.props.tokens[currentCoinAdress]) || {}
		
		let control 
		
		if (isMobile && !this.state.open) {
			control = <div className="sidebar-drag" onTouchStart={this.onMouseDown.bind(this)}>
						<div className="drag-line"/>
					</div>
		} else if (isMobile && this.state.open) {
			control = <div className="sidebar-back" onClick={this.onBackMobile.bind(this)}>
						BACK
					</div>
		} else {
			control = <div className="sidebar-close" onClick={this.onClose.bind(this)}>
						<Link to="/">X</Link>
					</div>
		}

		return (
			<div className={communitySidebarClass} ref="bar"
   				style={{
   					top: topPosition,
   					transition: this.state.open || this.state.closed ? 'all 350ms ease-in' : 'none'
   				}}>
				<div className="header">
					<CoinHeader coinImage={TlvCoin} name={currentCoin.name} price={currentCoin.currentPrice}/>
					{control}
					<div className="header-buttons">
						<div className="header-button">BUY</div>
						<div className="header-button">SELL</div>
					</div>
				</div>
				<div className="community-data-wrapper">
					<div className="box">
						<div className="box-header">SUMMARY</div>
						<div className="box-info">
							<div className="box-title column">
								<p>Symbol</p>
								<p>Owner</p>
								<p>Total supply</p>
								<p>Volume</p>
								<p>CLN reserve</p>
								<p>Asset ID</p>

							</div>
							<div className="box-data column">
								<p>{currentCoin.symbol}</p>
								<p>{currentCoin.owner}</p>
								<p>{currentCoin.totalSupply}</p>
								<p>{currentCoin.ccReserve + 'CLN'}</p>
								<p>{currentCoin.clnReserve + 'CLN'}</p>
								<p>{this.props.ui.activeMarker || currentCoin.address}</p>
							</div>
						</div>
					</div>
					<div className="box">
						<div className="box-header">COMMUNITY</div>
						<div className="box-info column">
							<div className="box-data">
								<p className="description">{currentCoin.metadata && currentCoin.metadata.description}</p>
							</div>
						</div>
						<div className="box-info">
							<div className="box-title column">
								<p>Website</p>
								<p>Location</p>
								<p>Social</p>
							</div>
							<div className="box-data column">
								<p>{currentCoin.metadata && currentCoin.metadata.website}</p>
								<p>{currentCoin.metadata && currentCoin.metadata.location.name}</p>
								<p>{currentCoin.metadata && currentCoin.metadata.social.facebook}</p>
							</div>
						</div>
					</div>
				</div>

			</div>
		)
	}
}

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
)(CommunitySidebar)
