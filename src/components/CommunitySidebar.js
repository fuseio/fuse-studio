import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Link from 'react-router-dom/Link'

import * as uiActions from '../actions/ui'
import { pagePath } from '../constants/uiConstants'

class CommunitySidebar extends Component {
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
		})//Object.values(pagePath) && Object.values(pagePath)
		console.log("RRRRRR", currentCoinAdress)
		const currentCoin = (this.props.tokens && this.props.ui && this.props.ui.activeMarker && this.props.tokens[this.props.ui.activeMarker]) 
							|| (this.props.tokens && this.props.tokens[currentCoinAdress]) || {}
		return (
			<div className="community-sidebar">
				<div className="header">
					<div className="sidebar-close" onClick={this.onClose.bind(this)}>
						<Link to="/">X</Link>
					</div>
					<div className="coin-header">
						<img src="src/images/tlv-coin.png"/>
						<div className="coin-details">
							<h1>{currentCoin.name}</h1>
							<h2>CURRENT PRICE 
								<span> 0.5CLN (+51)</span>
							</h2>
						</div>
					</div>
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
								<p>20 CLN</p>
								<p>500 CLN</p>
								<p>{this.props.ui.activeMarker}</p>
							</div>
						</div>
					</div>
					<div className="box">
						<div className="box-header">COMMUNITY</div>
						<div className="box-info column">
							<div className="box-data">
								<p>{currentCoin.metadata && currentCoin.metadata.description}</p>
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
								<p></p>
								<p>{currentCoin.metadata && currentCoin.metadata.social}</p>
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