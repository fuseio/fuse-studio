import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { isMobile } from "react-device-detect"
import { bindActionCreators } from 'redux'
import Link from 'react-router-dom/Link'
import { formatAmountReal } from '../services/global'
import * as uiActions from '../actions/ui'
import ReactGA from 'services/ga'

import { pagePath } from 'constants/uiConstants'

function rnd(m,n) {
	m = parseInt(m);
	n = parseInt(n);
	return Math.floor( Math.random() * (n - m + 1) ) + m;
}

// to make the points show up in round area instead of square
const randRadiusCoords = ([x, y], size) => {
	const t = 2 * Math.PI * Math.random()
	const h = size * Math.random()
	return [
		x + h * Math.cos(t),
		y + h * Math.sin(t),
	]
}

class MarkerSVG extends Component {
	state = {}
	componentWillReceiveProps(nextProps) {
		const { currentCoinAdress, activeMarker, community } = this.props

		if ((nextProps.activeMarker !== activeMarker && nextProps.activeMarker === community.address) ||
			(nextProps.activeMarker && currentCoinAdress === community.address && currentCoinAdress === nextProps.activeMarker)) {
				this.setState({grow: true})
		}

		if (nextProps.activeMarker !== activeMarker && nextProps.activeMarker !== community.address) {
			this.setState({grow: false})
		}
	}
	shouldComponentUpdate(nextProps) {
		if (nextProps.currentCoinAdress === this.props.currentCoinAdress && 
			nextProps.activeMarker === this.props.activeMarker &&
			nextProps.community === this.props.community) return false
		return true
	}

	onClick() {
		const community = this.props.community
		
		this.props.uiActions.setActiveMarker(this.props.community.address, community.metadata.location.geo)
		this.props.history.push(community.path)

		ReactGA.event({
			category: 'Map',
			action: 'Click',
			label: community.name
		})
	}

	render() {
		let bubblecount, bubblesize, limits, markerTransform, r
		let particles = []
		const currentCoin = this.props.community

		if (isMobile) {
			bubblecount = this.state.grow ? 60 : 2
			bubblesize = this.state.grow ? 30 : 15
			limits = this.state.grow ? 40 : 15
			markerTransform = this.state.grow ? "translate(-12, -24)" : "translate(-4, -14)"
		} else {
			bubblecount = this.state.grow ? 60 : 10
			bubblesize = this.state.grow ? 30 : 15
			limits = this.state.grow ? 30 : 10
			markerTransform = this.state.grow ? "translate(-15, -17)" : "translate(-4, -4)"
		}

		for (var i = 0; i <= bubblecount; i++) {
			var size = (rnd(20,bubblesize)/25)
			var coords = randRadiusCoords([0.9 * limits/2, 0.9 * limits/2], limits/2)
			if (i % 2 == 0) {
				particles.push(<circle className="particle" style={{
					animationDelay: (rnd(0,30)/10) + 's'
				}}
            	  fill="rgba(77, 217, 180, 0.7)"
            	  stroke="none"
            	  cx={coords[1]}
            	  cy={coords[0]}
            	  r={size}
            	/>)
			} else {
				particles.push(<circle className="particle2"
					style={{ animationDelay: (rnd(0,30)/10) + 's'}}
            		fill="rgba(154, 139, 255, 0.7)"
            		stroke="none"
            		cx={coords[1]}
            		cy={coords[0]}
            		r={size}
            	/>)
			}
		}

		if (this.state.grow) {
			r =  '8px'
		} else if (!this.state.grow && !isMobile) {
			r =  '2px'
		} else {
			r = '8px'
		}

		return (
			<g className="particles bubbles" transform={markerTransform} onClick={this.onClick.bind(this)}>
				<defs>
					<filter id="dropshadow" x="-42.3%" y="-42.3%" width="200%" height="200%">
					  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
					    <feMerge>
					        <feMergeNode in="coloredBlur"/>
					        <feMergeNode in="SourceGraphic"/>
					    </feMerge>
					</filter>
				</defs>
             	{particles}
             	<circle className="central"
             		style={{
						animationDelay: (rnd(0,30)/10) + 's',
						filter:'url(#dropshadow)'
					}}
            		fill="rgba(77, 217, 180, 0.9)"
            		stroke="none"
            		cx={this.state.grow ? 15 : 4}
            		cy={this.state.grow ? 14 : 4}
            		r={r}
            	/>
            	{this.state.grow ? <image width={"16px"} x="7" y="6" xlinkHref={currentCoin.metadata && currentCoin.metadata.imageLink} /> : null}
            </g>
		)
	}
}

//<div className={communityLabel}>
//	<div className="coin-label-name">{this.props.community.name}</div>
//	<div className="coin-label-price">{formattedPrice + 'CLN'}</div>
//</div>

const mapStateToProps = state => {
	return {
		activeMarker: state.ui.activeMarker
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
)(MarkerSVG)
