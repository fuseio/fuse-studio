import React, {Component} from 'react'
import { connect } from 'react-redux'
import Map from 'components/Map'
import TopNav from 'components/TopNav'
// import CommunitiesList from 'components/CommunitiesList'
import classNames from 'classnames'
import { AnimatedRoute } from 'react-router-transition'

import {fetchContractData} from 'actions/basicToken'

const clnAddress = '0x41C9d91E96b933b74ae21bCBb617369CBE022530'

const coluTokens = [
	clnAddress,
	'0x7629f7166270b236c9e04f180f0a8c8b4050613D',
	'0x228c74ff966b0EdE38E60DF560d4948fdA59ef9e'
]

import 'scss/styles.scss'


class App extends Component {
	state = {
		isWelcome: true,
		out: false
	}
	componentDidMount () {
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
		fetchContractData
	}
)(App)
