import React, { Component } from 'react'
import classNames from 'classnames'
import Link from 'react-router-dom/Link'

class CommunitySidebar extends Component {
	render() {
		return (
			<div className="community-sidebar">
				<div className="header">
					<div className="coin-header">
						<img src="src/images/lnd-coin.png"/>
						<div className="coin-details">
							<h1>TLV Coin</h1>
							<h2>CURRENT PRICE
								<span>0.5CLN(+51)</span>
							</h2>
						</div>
					</div>
					<div className="header-buttons">
						<div className="header-button">BUY</div>
						<div className="header-button">SELL</div>
					</div>
				</div>
				<p><Link to="/">X</Link></p>
			</div>
		)
	}
}

export default CommunitySidebar