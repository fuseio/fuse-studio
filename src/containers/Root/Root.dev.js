import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { ConnectedRouter, push } from 'react-router-redux'
import Link from 'react-router-dom/Link'
import createHistory from 'history/createBrowserHistory'
import { Route } from 'react-router'
import { AnimatedRoute } from 'react-router-transition';

import App from 'containers/App'
import CommunitySidebar from 'components/CommunitySidebar'

const history = createHistory()

const sidebarTransition = {
  atEnter: {
    offset: 100,
  },
  atLeave: {
    offset: 100,
  },
  atActive: {
    offset: 0,
  },
}

function mapStyles(styles) {
  return {
    transform: `translateX(${styles.offset}%)`,
  };
}

export default class Root extends Component {
  render () {
    const { store } = this.props
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div>
            <App supportsToken={store.supportsToken}/>
            <div className="sidebar">
              <AnimatedRoute
                path="/sidebar"
                component={CommunitySidebar}
                mapStyles={mapStyles}
                {...sidebarTransition}
              />
            </div>
          </div>
        </ConnectedRouter>
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}
