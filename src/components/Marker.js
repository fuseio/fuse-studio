import React, { Component } from 'react'
import posed from 'react-pose'
import classNames from 'classnames'
import Link from 'react-router-dom/Link'


const Outline = posed.path({
	open: { scale: 2, y: -40 },
  	closed: {
  		scale: 1,
  		y: 0
    }
})
const Circle = posed.path({
	open: {
		scale: 2,
		y: -50,

	},
  	closed: {
  		scale: 1,
  		y: 0
    }
})
const Icon = posed.path({
	open: { scale: 0, y: -40 },
  	closed: {
  		scale: 1,
  		y: 0
    }
})

const Text = posed.text({
	open: { scale: 0, y: -40 },
  	closed: {
  		scale: 1,
  		y: 0
    }
})

class Marker extends Component {
	componentDidMount () {

	}

	state = {

	}

	handleHover = (value) => {
		this.setState({isOpen: value})
	}

	render() {
		let example = classNames({
			"fullscreen": true
		})

		return (
			<div style={{width: "80px", height: "100px"}}>
				<svg className='marker' viewBox="0 0 120 150.7" onMouseEnter={this.handleHover.bind(this, true)} onMouseLeave={this.handleHover.bind(this, false)}>
				<defs>
				  <clipPath id="circle">
				    <path d="M36,97.4c15,0,27.3-12.2,27.3-27.3c0-15-12.2-27.3-27.3-27.3S8.7,55.1,8.7,70.2S21,97.4,36,97.4z"/>
				  </clipPath>
				</defs>
				<Outline pose={this.state.isOpen ? 'open' : 'closed'} className='e-marker__marker' d="M60.7,45.4C54.1,38.8,45.3,35.2,36,35.2c-9.3,0-18.1,3.6-24.7,10.3C4.6,52,1,60.8,1,70.2c0,6.3,1.5,11.6,4.6,16.7 C8.4,91.3,12.1,95,16,98.9c7.3,7.2,15.5,15.4,19,30.5c0.1,0.5,0.5,0.8,1,0.8s0.9-0.3,1-0.8c3.5-15.1,11.7-23.3,19-30.5 c3.9-3.9,7.6-7.6,10.4-12.1c3.1-5.1,4.6-10.3,4.6-16.7C71,60.8,67.4,52,60.7,45.4z M36,97.4c-15,0-27.3-12.2-27.3-27.3 S21,42.9,36,42.9c15,0,27.3,12.2,27.3,27.3C63.3,85.2,51,97.4,36,97.4z"/>
				<Circle pose={this.state.isOpen ? 'open' : 'closed'} className="e-marker__circle" d="M36,97.4c15,0,27.3-12.2,27.3-27.3c0-15-12.2-27.3-27.3-27.3S8.7,55.1,8.7,70.2S21,97.4,36,97.4z"/>
				<Icon pose={this.state.isOpen ? 'open' : 'closed'} className="e-marker__icon" d="M38.3,74.8l2.9-2.9L54,84.8l-2.9,2.9L38.3,74.8z M46.8,63.3l5.7-5.7c-7.9-7.9-20.7-7.9-28.6,0C31.8,55,40.6,57.1,46.8,63.3z
				   M23.9,57.6c-7.9,7.9-7.9,20.7,0,28.6l5.7-5.7C23.4,74.2,21.3,65.5,23.9,57.6z M23.9,57.6L23.9,57.6c-0.8,6,2.3,13.8,8.6,20.1
				  L44,66.2C37.7,59.9,30,56.8,23.9,57.6z"/>
				<image className="e-marker__image" width="100%" height="100%" clip-path="url(#circle)" />
				
				<text className="e-marker__text" transform="matrix(1 0 0 1 13.6803 13.9998)">
				    <tspan x="0" y="0" >Tel Aviv</tspan>
				    <tspan x="0" y="12" >CC</tspan>      
				</text>
			</svg>
			<Link to="/sidebar">Show sidebar</Link>
			</div>
		)
	}
}

export default Marker
