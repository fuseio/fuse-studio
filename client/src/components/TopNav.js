import React, { Component } from "react"
import classNames from 'classnames'
import Link from 'react-router-dom/Link'
import { isBrowser, isMobile, BrowserView, MobileView } from "react-device-detect"

class TopNav extends Component {
	render() {
		let topNavClass = classNames({
			"active": this.props.active,
			"top-navigator": true
		})
		return <div className={topNavClass}>
			<img src="src/images/cln.png"/>
			
				<div className="top-nav-links">
					<a className="top-nav-text">Whitepaper</a>
					<a className="top-nav-text">Q&A</a>
					<Link to="/contact-us">
						<a className="top-nav-text">Contact us</a>
					</Link>
					<div className="top-nav-text">
						<img src="src/images/profile.png"/>
						<span>Disconnected</span>
					</div>
				</div>
			
			<MobileView device={isMobile}>
				<img src="src/images/menu.png" className="mobile-menu-icon"/>
			</MobileView>
		</div>
	}
}

export default TopNav