import React, { Component } from 'react'
import ReactGA from 'services/ga'

const withTracker = (WrappedComponent, options = {}) => {
  const trackPage = page => {
    ReactGA.set({
      page,
      ...options
    })
    ReactGA.pageview(page)
  }

  const Tracker = class extends Component {
    componentDidMount () {
      const page = this.props.location.pathname
      trackPage(page)
    }

    componentWillReceiveProps (nextProps) {
      const currentPage = this.props.location.pathname
      const nextPage = nextProps.location.pathname

      if (currentPage !== nextPage) {
        trackPage(nextPage)
      }
    }

    render () {
      return <WrappedComponent {...this.props} />
    }
  }

  return Tracker
}

export default withTracker
