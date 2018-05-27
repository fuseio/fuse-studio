import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { isMobile } from "react-device-detect"
import { bindActionCreators } from 'redux'
import Link from 'react-router-dom/Link'
import { formatAmountReal } from '../services/global'
import * as uiActions from '../actions/ui'
import { pagePath } from 'constants/uiConstants'


function rnd(m,n) {
	m = parseInt(m);
	n = parseInt(n);
	return Math.floor( Math.random() * (n - m + 1) ) + m;
}

class Marker extends React.PureComponent {
	state = {}

	componentWillReceiveProps(nextProps) {
		let currentCoinAdress = this.props.currentCoinAdress

		if ((nextProps.activeMarker !== this.props.activeMarker && nextProps.activeMarker === this.props.id) || (nextProps.activeMarker && currentCoinAdress === this.props.id && currentCoinAdress === nextProps.activeMarker)) {
			setTimeout(() => {
				this.setState({grow: true})
			}, 500)
		}
		if (nextProps.activeMarker !== this.props.activeMarker && nextProps.activeMarker !== this.props.id) {
			//setTimeout(() => {
				this.setState({grow: false})
			//}, 1000)
		}
	}
	handleHover = (value) => {
		this.setState({isOpen: value})
	}

	render() {
		let communityLabel = classNames({
			"community-label-active": this.state.isOpen || this.state.grow,
			"community-label": true
		})

		let markerArea = classNames({
			"particles": true,
			"bubbles": true,
			"grow": this.state.grow,
			"grow-center": this.state.grow
		})

		let bubblecount, bubblesize, limits
		let particles = []

		if (isMobile) {
			bubblecount = this.state.grow ? 60 : 7
			bubblesize = this.state.grow ? 60 : 40
			limits = this.state.grow ? 120 : 30
		} else {
			bubblecount = this.state.grow ? 100 : 15
			bubblesize = this.state.grow ? 60 : 50
			limits = this.state.grow ? 120 : 30
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

		for (var i = 0; i <= bubblecount; i++) {
			var size = (rnd(20,bubblesize)/10)
			var coords = randRadiusCoords([0.9 * limits/2, 0.9 * limits/2], limits/2)
			if (i % 2 == 0) {
				particles.push(<div key={i} className="particle" style={{
					top: coords[0],
					left: coords[1],
					width: size + 'px',
					height: size + 'px',
					animationDelay: (rnd(0,30)/10) + 's'
				}}/>)
			} else {
				particles.push(<div key={i} className="particle2" style={{
					top: coords[0],
					left: coords[1],
					width: size + 'px',
					height: size + 'px',
					animationDelay: (rnd(0,30)/10) + 's'
				}}/>)
			}
		}

		const formattedPrice = this.props.community.price || this.props.community.price === 0 ? formatAmountReal(this.props.community.price, 18) : 'loading'

		return (
			<Link to={this.props.pagePath}>
				<div className='marker' 
					onMouseEnter={this.handleHover.bind(this, true)}
					onMouseLeave={this.handleHover.bind(this, false)}
					onClick={this.props.onClick}>
					<div className={markerArea} >
						{particles}
					</div>
					<div className={communityLabel}>
						<div className="coin-label-name">{this.props.community.name}</div>
					</div>
				</div>
			</Link>
		)
	}
}

//<div className={communityLabel}>
//	<div className="coin-label-name">{this.props.community.name}</div>
//	<div className="coin-label-price">{formattedPrice + 'CLN'}</div>
//</div>

const mapStateToProps = state => {
	return {
		tokens: state.tokens,
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
)(Marker)