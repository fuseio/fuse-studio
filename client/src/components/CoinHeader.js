import React, { Component } from 'react'
import classNames from 'classnames'


export default class CoinHeader extends Component {
	render() {
		return (
			<div className="coin-header">
				<img src={this.props.coinImage} />
				<div className="coin-details">
					<h1>{this.props.name}</h1>
					<div className="separator"/>
					<div className="price-wrapper">
						<h2>Current price:</h2>
						<p>{this.props.price + 'CLN'}</p>
					</div>
				</div>
			</div>
		)
	}
}