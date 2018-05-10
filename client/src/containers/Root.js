import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
import { AnimatedRoute } from 'react-router-transition'
import { isMobile } from "react-device-detect"

import App from 'containers/App'
import CommunitySidebar from 'components/CommunitySidebar'
import ContactForm from 'components/ContactForm'
import CurrencyFactoryContract from 'containers/CurrencyFactoryContract'
import Web3Loader from 'containers/Web3Loader'

import { pagePath } from 'constants/uiConstants'

const history = createHistory()

const sidebarTransition = {
	atEnter: {
		offset: 100
	},
	atLeave: {
		offset: 100
	},
	atActive: {
		offset: 0
	},
}

const sidebarMobileTransition = {
	atEnter: {
		offset: 20,
	},
	atLeave: {
		offset: 20,
	},
	atActive: {
		offset: 0,
	},
}

const contactFormTransition = {
	atEnter: {
		offset: 100,
		opacity: 0
	},
	atLeave: {
		offset: 100,
		opacity: 0
	},
	atActive: {
		offset: 0,
		opacity: 1
	},
}

function mapStyles(styles) {
	return {
		transform: `translateX(${styles.offset}%)`,
	};
}

function mapStylesMobile(styles) {
	return {
		transform: `translateY(${styles.offset}%)`,
	};
}

function mapStylesContact(styles) {
	return {
		transform: `translateY(${styles.offset}%)`,
		opacity: `${styles.opacity}`
	};
}

export default class Root extends Component {
	render () {
		const { store } = this.props
		const sidebarAnimation = isMobile ? sidebarMobileTransition : sidebarTransition
		return (
			<Provider store={store}>
				<Web3Loader>
					<ConnectedRouter history={history}>
						<div>
							<Route path="/create" component={CurrencyFactoryContract} />
							<App />
							<div className="sidebar">
								<AnimatedRoute
									path={pagePath.telaviv.path}
									component={CommunitySidebar}
									mapStyles={isMobile ? mapStylesMobile : mapStyles}
									{...sidebarAnimation}
								/>
								<AnimatedRoute
									path={pagePath.london.path}
									component={CommunitySidebar}
									mapStyles={isMobile ? mapStylesMobile : mapStyles}
									{...sidebarAnimation}
								/>
								<AnimatedRoute
									path={pagePath.haifa.path}
									component={CommunitySidebar}
									mapStyles={isMobile ? mapStylesMobile : mapStyles}
									{...sidebarAnimation}
								/>
								<AnimatedRoute
									path={pagePath.liverpool.path}
									component={CommunitySidebar}
									mapStyles={isMobile ? mapStylesMobile : mapStyles}
									{...sidebarAnimation}
								/>
							</div>
							<div className="contact-form-wrapper">
								<AnimatedRoute
									path="/contact-us"
									component={ContactForm}
									mapStyles={mapStylesContact}
									{...contactFormTransition}
								/>
							</div>
						</div>
					</ConnectedRouter>
				</Web3Loader>
			</Provider>
		)
	}
}

Root.propTypes = {
	store: PropTypes.object.isRequired
}
