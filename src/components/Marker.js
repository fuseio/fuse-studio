import React, { Component } from 'react'
import posed from 'react-pose'
import classNames from 'classnames'
import Link from 'react-router-dom/Link'

const Outline = posed.path({
	open: { scale: 2.4, y: -31 },
  	closed: {
  		scale: 1,
  		y: 0
    }
})

const Icon = posed.image({
	open: { scale: 0, y: -15, x: - 14 },
  	closed: {
  		scale: 1.3,
  		y: -51,
  		x: - 14
    }
})

function rnd(m,n) {
      m = parseInt(m);
      n = parseInt(n);
      return Math.floor( Math.random() * (n - m + 1) ) + m;
}


class Marker extends React.PureComponent {
	componentDidMount () {

	}

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
		console.log("RENDER AGAIN?")
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
				<div className='marker' style={{width: "120px", height: "124px"}} onMouseEnter={this.handleHover.bind(this, true)} onMouseLeave={this.handleHover.bind(this, false)} onClick={this.onClick}>
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

//<svg className='marker' viewBox="0 0 50 64" onMouseEnter={this.handleHover.bind(this, true)} onMouseLeave={this.handleHover.bind(this, false)}>
//	<defs>
//		<filter id="a" width="229.4%" height="184%" x="-64.7%" y="-28%" filterUnits="objectBoundingBox">
//		    <feOffset dy="4" in="SourceAlpha" result="shadowOffsetOuter1"/>
//		    <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="4"/>
//		    <feColorMatrix in="shadowBlurOuter1" result="shadowMatrixOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
//		    <feMerge>
//		        <feMergeNode in="shadowMatrixOuter1"/>
//		        <feMergeNode in="SourceGraphic"/>
//		    </feMerge>
//		</filter>
//	</defs>
//	<Outline pose={this.state.isOpen ? 'open' : 'closed'} className={markerClass} d="M17 49.241S0 25.89 0 16.68C0 7.467 7.611 0 17 0s17 7.467 17 16.679c0 9.21-17 32.562-17 32.562zm0-24.62a7.62 7.62 0 1 0 0-15.242 7.62 7.62 0 0 0 0 15.242z" filter="url(#a)"/>
//	<Icon pose={this.state.isOpen ? 'closed' : 'open'} className="e-marker__image" href="src/images/lnd-coin.png" width="62" height="62" />
//</svg>
export default Marker
