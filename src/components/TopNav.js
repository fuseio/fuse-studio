import React, { Component } from "react"
import { mapStyle, googleMapsUrl } from '../constants/uiConstants'
import classNames from 'classnames'

class TopNav extends Component {
	render() {
		let topNavClass = classNames({
			"active": this.props.active,
			"top-navigator": true
		})
		return <div className={topNavClass}>
			<img src="src/images/cln.png"/>
			<div className="top-nav-links">
				<div className="top-nav-text">Whitepaper</div>
				<div className="top-nav-text">Q&A</div>
				<div className="top-nav-text">Contact us</div>
			</div>
		</div>
	}
}

export default TopNav