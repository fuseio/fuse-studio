import React, { Component } from 'react'
import classNames from 'classnames'
import Link from 'react-router-dom/Link'
import { isMobile, MobileView } from 'react-device-detect'
import ClnIcon from 'images/cln.png'
import ProfileIcon from 'images/profile.png'
import MenuIcon from 'images/menu.png'

class TopNav extends Component {
	render() {
		let topNavClass = classNames({
			"active": this.props.active,
			"top-navigator": true
		})
		return <div className={topNavClass}>
			<img src={ClnIcon}/>

				<div className="top-nav-links">
					<a className="top-nav-text">Whitepaper</a>
					<a className="top-nav-text">Q&A</a>
					<Link to="/contact-us">
						<a className="top-nav-text">Contact us</a>
					</Link>
					<div className="top-nav-text">
						<img src={ProfileIcon}/>
						<span>Disconnected</span>
					</div>
				</div>

			<MobileView device={isMobile}>
				<img src={MenuIcon} className="mobile-menu-icon"/>
			</MobileView>
		</div>
	}
}

export default TopNav
