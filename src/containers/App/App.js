import React, {Component} from 'react'
import { connect } from 'react-redux'

import Network from 'containers/Network'
import Communities from 'components/Communities'
import Map from 'components/Map'
import TopNav from 'components/TopNav'
import CommunitiesList from 'components/CommunitiesList'
import Storage from 'components/Storage'
import classNames from 'classnames'
import {fetchSupportsToken} from 'actions'
import {fetchName, balanceOf, transfer} from 'actions/basicToken'
import { AnimatedRoute } from 'react-router-transition';

import 'scss/styles.scss' 


class App extends Component {
	state = {
		isWelcome: true
	}
	componentDidMount () {
		//this.props.fetchSupportsToken('0x41C9d91E96b933b74ae21bCBb617369CBE022530')
		//this.props.fetchName()
		//this.props.balanceOf('0x0d4DF041Dbef6fFC0E444a4a213774AdB0c118C2')

		// Fetch token info (from blockchain and ipfs and combine them), try to fetch all fields in one call
		// all 4 tokens info: 
		// Coin name
		// Symbol
		// Owner
		// Total supply
		// Link to contract
		// Location
		// Community info
		// Website

		// From market maker/factory contract fetch price, CLN reserve
	}

	onClickExplore() {
		this.setState({
			isWelcome: !this.state.isWelcome,
			panBy: { x: -100, y: 0 }
		})
	}

	render() {
		let currentRoute = this.props && this.props.router && this.props.router.location && this.props.router.location.pathname
		console.log("render app new", currentRoute)
		let panBy = { x: 0, y: 0 }
		let mainContainerClass = classNames({
			"main-container": true,
			"flex": true,
			"column": true,
		})
		let welcomeClass = classNames({
			"welcome-wrapper": true,
			"active": this.state.isWelcome
		})
		if (currentRoute === '/sidebar') {
			panBy = { x: -100, y: 0 }
		}

		const welcome = <div className={welcomeClass}>
							<h3>Welcome to CLN Community App</h3>
							<h4>You can buy and sell community currencies with your CLN tokens</h4>
							<div className="button" onClick={this.onClickExplore.bind(this)}>EXPLORE</div>
						</div>

		return <div className="flex column center">
			{welcome}

			<div className={mainContainerClass}>
				<TopNav active={!this.state.isWelcome}/>
				<Map key="map" active={!this.state.isWelcome}/>
			</div>
		</div>
	}
}

//<CommunitiesList active={!this.state.isWelcome}/>
const mapStateToProps = (state) => state

export default connect(
	mapStateToProps, {
		fetchSupportsToken,
		fetchName,
		balanceOf,
		transfer
	}
)(App)
