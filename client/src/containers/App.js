import React, {Component} from 'react'
import { connect } from 'react-redux'
import Map from 'components/Map'
import TopNav from 'components/TopNav'
// import CommunitiesList from 'components/CommunitiesList'
import classNames from 'classnames'

import {fetchContractData} from 'actions/basicToken'
import {getNetworkType} from 'actions/web3'
import addresses from 'constants/addresses'

const coluTokens = [
	addresses.ColuLocalNetwork,
	addresses.TelAvivCoinAddress,
	addresses.LondonCoinAddress
]

import 'scss/styles.scss'


class App extends Component {
	state = {
		isWelcome: true,
		out: false
	}
	componentDidMount () {
		coluTokens.forEach(this.props.fetchContractData)

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

		const welcome = <div className={welcomeClass}>
							<h3>Welcome to the CLN Community dApp</h3>
							<h4>Here you can monitor the status of the CLN economies, buy and sell local community currencies issued on the network and more</h4>
							<div className="button" onClick={this.onClickExplore.bind(this)}>EXPLORE</div>
						</div>

		return <div className="flex column center">
			{}
			<div className={mainContainerClass}>
				<TopNav active={!this.state.isWelcome}/>
				<Map key="map" active={!this.state.isWelcome}/>
			</div>
		</div>
	}
}


//<CommunitiesList active={!this.state.isWelcome}/>
const mapStateToProps = state => {
	return {}
}

export default connect(
	mapStateToProps, {
		fetchContractData,
		getNetworkType
	}
)(App)
