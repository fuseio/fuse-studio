import React, {Component} from 'react'
import { connect } from 'react-redux'
import Map from 'components/Map'
import TopNav from 'components/TopNav'
// import CommunitiesList from 'components/CommunitiesList'
import classNames from 'classnames'
import { AnimatedRoute } from 'react-router-transition'

import {fetchContractData} from 'actions/basicToken'
import {getNetworkType} from 'actions/web3'

const clnAddress = '0x41C9d91E96b933b74ae21bCBb617369CBE022530'

const coluTokens = [
	clnAddress,
	'0x647ffaCf736eFf6e7665Ea88e2E1CE2040199934',
	'0x0B7d4f3FdB3b517984b68F67Fb2c4528eBf44A7B'
]

import 'scss/styles.scss'


class App extends Component {
	state = {
		isWelcome: true,
		out: false
	}
	componentDidMount () {
		this.props.getNetworkType()
		coluTokens.forEach(this.props.fetchContractData)

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
		fetchContractData,
		getNetworkType
	}
)(App)
