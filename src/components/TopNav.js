import React, { Component } from "react"
import { mapStyle, googleMapsUrl } from '../constants/uiConstants'

class TopNav extends Component {
	render() {
		return <div className="top-navigator">
			<div className="top-nav-text">Whitepaper</div>
			<div className="top-nav-text">Q&A</div>
			<div className="top-nav-text">Contact us</div>
		</div>
	}
}

export default TopNav