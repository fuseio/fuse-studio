import React, {Component} from 'react'
import { connect } from 'react-redux'
import Map from 'components/Map'
import TopNav from 'components/TopNav'
import CommunitiesList from 'components/CommunitiesList'
import classNames from 'classnames'
import { AnimatedRoute } from 'react-router-transition';

import IPFSStorage from 'components/IPFSStorage'
import {fetchSupportsToken} from 'actions'
import {name, balanceOf, transfer, fetchContractData} from 'actions/basicToken'

const clnAddress = '0x41C9d91E96b933b74ae21bCBb617369CBE022530'

const coluTokens = [
	clnAddress,
	'0x296582CAb0e44009d2142D7daf33C81f153407F8',
	'0x3355e0C28D759d6d4eF649EF3a6dba11402d1a7f'
]

import 'scss/styles.scss' 


class App extends Component {
	state = {
		isWelcome: true,
		out: false
	}
	componentDidMount () {
		coluTokens.forEach(this.props.fetchContractData)
    	// this.props.fetchContractData(clnAddress)
    	this.props.fetchSupportsToken(clnAddress, '0x41C9d91E96b933b74ae21bCBb617369CBE022530')
    	// this.props.name(clnAddress)
    	this.props.balanceOf(clnAddress, '0x0d4DF041Dbef6fFC0E444a4a213774AdB0c118C2')

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

		setTimeout(() => {
			this.setState({
				out: true
			})
		}, 1000)
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
			"hide": !this.state.isWelcome,
			"out": this.state.out
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
		name,
		balanceOf,
		transfer,
		fetchContractData
	}
)(App)
