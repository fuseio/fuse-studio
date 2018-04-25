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
								<p>d9ohgk6wruYptPeoDQRHRif8fG2vJe1uN4ryz</p>
							</div>
							<div className="box-data column">
								<p>TLV</p>
								<p>Colu</p>
								<p>50,000,000</p>
								<p>20 CLN</p>
								<p>500 CLN</p>
							</div>
						</div>
					</div>
					<div className="box">
						<div className="box-header">COMMUNITY</div>
						<div className="box-info column">
							<div className="box-data">
								<p>TLV is Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s </p>
							</div>
						</div>
						<div className="box-info">
							<div className="box-title column">
								<p>Website</p>
								<p>Location</p>
								<p>Social</p>
							</div>
							<div className="box-data column">
								<p>TLV - Jaffa</p>
								<p>www.colu.com</p>
								<p>F T</p>
							</div>
						
						</div>
					</div>
				</div>
				<p><Link to="/">X</Link></p>
			</div>
		)
	}
}

export default CommunitySidebar