import React, { Component } from 'react'
import classNames from 'classnames'
import Link from 'react-router-dom/Link'

function rnd(m,n) {
	m = parseInt(m);
	n = parseInt(n);
	return Math.floor( Math.random() * (n - m + 1) ) + m;
}

class Marker extends React.PureComponent {
	state = {

	}
	handleHover = (value) => {
		this.setState({isOpen: value})
	}

	onClick = () => {
		this.props.onClick();
		setTimeout(() => {
			this.setState({grow: true})
		}, 1000)
	}

	render() {
		let markerClass = classNames({
			"purple": this.state.isOpen,
			"e-marker__marker": true
		})

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

		return (
			<Link to="/sidebar">
				<div className='marker' 
					onMouseEnter={this.handleHover.bind(this, true)}
					onMouseLeave={this.handleHover.bind(this, false)}
					onClick={this.onClick}>
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

export default Marker