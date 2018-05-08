import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Link from 'react-router-dom/Link'

import * as uiActions from '../actions/ui'

function rnd(m,n) {
	m = parseInt(m);
	n = parseInt(n);
	return Math.floor( Math.random() * (n - m + 1) ) + m;
}

class Marker extends React.PureComponent {
	state = {

	}
	//shouldComponentUpdate(thisProps, nextProps) {
	//	if (thisProps.activeMarker !== nextProps.activeMarker) return true
	//	else return false
	//}
	componentWillReceiveProps(nextProps) {
		
		if (nextProps.activeMarker !== this.props.activeMarker && nextProps.activeMarker === this.props.id) {
			setTimeout(() => {
				this.setState({grow: true})
			}, 1000)
		}
		if (nextProps.activeMarker !== this.props.id) {
			//setTimeout(() => {
				this.setState({grow: false})
			//}, 1000)
		}
	}
	handleHover = (value) => {
		this.setState({isOpen: value})
	}

	//onClick = () => {
	//	this.props.onClick();
	//}

	render() {
		//let markerClass = classNames({
		//	"purple": this.state.isOpen,
		//	"e-marker__marker": true
		//})

		let communityLabel = classNames({
			"community-label-active": this.state.isOpen || this.state.grow,
			"community-label": true
		})

		let markerArea = classNames({
			"particles": true,
			"bubbles": true,
			"grow": this.state.grow
		})

		const bubblecount = this.state.grow ? 120 : 20
		const bubblesize = this.state.grow ? 100 : 50
		const limits = this.state.grow ? 120 : 30
		let particles = []

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

		//console.log("RENDER MARKER")

		return (
			<Link to="/sidebar">
				<div className='marker' 
					onMouseEnter={this.handleHover.bind(this, true)}
					onMouseLeave={this.handleHover.bind(this, false)}
					onClick={this.props.onClick}>
					<div className={markerArea} >
						{particles}
					</div>
					<div className={communityLabel}>
						<div className="coin-label-name">{this.props.community.name}</div>
						<div className="coin-label-price">{this.props.community.price}</div>
					</div>
				</div>
			</Link>
		)
	}
}

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