import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classNames from 'classnames'
import Link from 'react-router-dom/Link'
import { isMobile, MobileView } from 'react-device-detect'
import * as uiActions from 'actions/ui'

import { LOGIN_MODAL } from 'constants/uiConstants'

import ClnIcon from 'images/cln.png'
import MenuIcon from 'images/menu.png'
import ProfileIcon from 'images/profile.png'

class TopNav extends Component {
	state = {
		openMenu: false
	}
	onClickMenu = () => {
		this.setState({
			openMenu: !this.state.openMenu
		})
	}
	showLoginMenu() {
    	this.props.uiActions.loadModal(LOGIN_MODAL);
  	}
  	showContactUs() {
  		if (this.props.history.location.pathname === '/view/contact-us') {
  			this.props.history.replace('/view/contact-us')
  		} else {
  			this.props.history.push('/view/contact-us')
  		}
  		
  	}
	render() {
		let topNavClass = classNames({
			"active": this.props.active,
			"top-navigator": true
		})
		let navLinksClass = classNames({
			"hide": !this.state.openMenu && isMobile,
			"top-nav-links": true
		})

		return <div className={topNavClass}>
			<img src={ClnIcon}/>

			<div className={navLinksClass}>
				<a className="top-nav-text">Whitepaper</a>
				<div className="separator"/>
				<a className="top-nav-text">Q&A</a>
				<div className="separator"/>
				<div onClick={this.showContactUs.bind(this)} >
					<div className="top-nav-text">Contact us</div>
				</div>
				<div className="separator"/>
				<div className="top-nav-text" onClick={this.showLoginMenu.bind(this)}>
					<img src={ProfileIcon} />
					<span>Disconnected</span>
				</div>
				<div className="separator"/>
			</div>

			<MobileView device={isMobile}>
				<img src={MenuIcon} className="mobile-menu-icon" onClick={this.onClickMenu}/>
			</MobileView>
		</div>
	}
}


const mapDispatchToProps = dispatch => {
    return {
        uiActions: bindActionCreators(uiActions, dispatch),
    }
}
export default connect(null, mapDispatchToProps)(TopNav)