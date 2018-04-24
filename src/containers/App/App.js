import React, {Component} from 'react'
import { connect } from 'react-redux'

import Network from 'containers/Network'
import Communities from 'components/Communities'
import Map from 'components/Map'
import TopNav from 'components/TopNav'
import Storage from 'components/Storage'
import classNames from 'classnames'
import {fetchSupportsToken} from 'actions'
import {fetchName, balanceOf, transfer} from 'actions/basicToken'
import { AnimatedRoute } from 'react-router-transition';

import 'scss/styles.scss' 


class App extends Component {
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

	render() {
		let currentRoute = this.props && this.props.router && this.props.router.location && this.props.router.location.pathname
		console.log("render app new", currentRoute)
		let panBy = { x: 0, y: 0 }
		if (currentRoute === '/sidebar') {
			panBy = { x: -100, y: 0 }
		}

		return <div className="flex column center">
			<div className="main-container flex column">
				<TopNav />
				<Map key="map" panBy={panBy} />
			</div>

		</div>
	}
}

const mapStateToProps = (state) => state

export default connect(
	mapStateToProps, {
		fetchSupportsToken,
		fetchName,
		balanceOf,
		transfer
	}
)(App)
