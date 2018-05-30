import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Link from 'react-router-dom/Link'
import _ from  'lodash'
import { isBrowser, isMobile } from "react-device-detect"
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { pagePath } from 'constants/uiConstants'
import { formatAmount, formatMoney } from 'services/global'

import { SOON_MODAL } from 'constants/uiConstants'

import TlvCoin from 'images/tlv-coin.png'
import Facebook from 'images/fb.png'
import Twitter from 'images/twitter.png'
import Instagram from 'images/ig.png'
import CloseButton from 'images/x.png'
import clnCurrencyIcon from 'images/cln-coin.png'
import {getSelectedCommunity} from 'selectors/basicToken'
import CoinHeader from './CoinHeader'


class CommunitySidebar extends Component {
	state = {
		pos: {y: 0},
    	dragging: false,
    	rel: null
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

	onClickBuy = () => {
    	this.props.uiActions.loadModal(SOON_MODAL);
  	}

  	onClickSell = () => {
    	this.props.uiActions.loadModal(SOON_MODAL);
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
		if (isMobile) {
			setTimeout(() => {this.props.uiActions.zoomToMarker(n - 4)}, 550)
		}
		this.props.uiActions.setActiveMarker()

	}
	render() {
		const currentCoin = this.props.selectedCommunity || {}

		const control = <div className="sidebar-close" onClick={this.onClose.bind(this)}>
						<Link to="/">
							<img src={CloseButton}/>
						</Link>
					</div>

		const totalSupply = currentCoin.totalSupply ? formatMoney(formatAmount(currentCoin.totalSupply, 18), 0, '.', ',') : 'loading'
		const circulatingSupply = currentCoin.ccReserve ? formatMoney(formatAmount(currentCoin.totalSupply - currentCoin.ccReserve, 18), 0, '.', ',') : 'loading'
		const clnReserve = currentCoin.clnReserve ? formatMoney(formatAmount(currentCoin.clnReserve, 18), 0, '.', ',') : 'loading'
		const owner = currentCoin.owner === "0xA1F05144f9d3298a702c8EEE3ca360bc87d05207" ? "Colu" : currentCoin.owner
		const social = currentCoin.metadata && currentCoin.metadata.social && _.flatMap(currentCoin.metadata.social, (value, key) => {
										let imgSrc
										if (key === 'facebook') imgSrc = Facebook
										else if (key === 'twitter') imgSrc = Twitter
										else if (key === 'instagram') imgSrc = Instagram
										return <a href={value} target="blank" key={key}>
											<img src={imgSrc}/>
										</a>
									})
		return (
			<div className="community-sidebar" ref="bar"
   				style={{
   					transition: this.state.open || this.state.closed ? 'all 350ms ease-in' : 'none'
   				}}>
				<div className="header">
					<CoinHeader coinImage={currentCoin.metadata && currentCoin.metadata.imageLink} name={currentCoin.name} price={currentCoin.currentPrice}/>
					{control}
					<div className="header-buttons">
						<div className="header-button" onClick={this.onClickBuy}>BUY</div>
						<div className="header-button" onClick={this.onClickSell}>SELL</div>
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
								<p>Circulating Supply</p>
								<p>CLN reserve</p>
								<p>Asset ID</p>
								<p>Market Maker ID</p>
							</div>
							<div className="box-data column">
								<p>{currentCoin.symbol || 'loading'}</p>
								<p>
									<a href={"https://etherscan.io/address/" + currentCoin.owner} target="blank">{owner || 'loading'}</a>
								</p>
								<p>{totalSupply + ' ' + (currentCoin.symbol || 'loading') || 'loading'}</p>
								<p>{circulatingSupply + ' ' + (currentCoin.symbol || 'loading') || 'loading'}</p>
								<p><img src={clnCurrencyIcon}/>{clnReserve || 'loading'}</p>
								<p>
									<a href={"https://etherscan.io/address/" + (this.props.ui.activeMarker || currentCoin.address)} target="blank">{this.props.ui.activeMarker || currentCoin.address}</a>
								</p>
								<p>
									<a href={"https://etherscan.io/address/" + currentCoin.mmAddress} target="blank">{currentCoin.mmAddress}</a>
								</p>
							</div>
						</div>
					</div>
					<div className="box">
						<div className="box-header">COMMUNITY</div>
						<div className="box-info column">
							<div className="box-data">
								<p className="description">{currentCoin.metadata && currentCoin.metadata.description || 'loading'}</p>
							</div>
							<div className="separator" />
						</div>

						<div className="box-info">
							<div className="box-title column">
								<p>Website</p>
								<p>Location</p>
								<p>Social</p>
							</div>
							<div className="box-data column">
								<p><a href={currentCoin.metadata && currentCoin.metadata.website} target="blank">{currentCoin.metadata && currentCoin.metadata.website}</a></p>
								<p>{currentCoin.metadata && currentCoin.metadata.location.name}</p>

								<div className="social flex">
									{social}
								</div>
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
		ui: state.ui,
		selectedCommunity: getSelectedCommunity(state)
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
