import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { hideModal } from 'actions/ui'
import ReactGA from 'services/ga'

const withTracker = (WrappedComponent, options = {}) => {
  const trackPage = page => {
    ReactGA.set({
      page,
      ...options
    })
    if (window.analytics) {
      window.analytics.page(page)
      ReactGA.pageview(page)
    }
  }

  const Tracker = class extends PureComponent {
    componentDidMount () {
      const page = this.props.location.pathname
      trackPage(page)
    }

    componentDidUpdate (prevProps) {
      const prevPage = prevProps.router.location.pathname
      const nextPage = this.props.router.location.pathname
      if (prevPage !== nextPage) {
        trackPage(nextPage)

        if (this.props.modalType) {
          this.props.hideModal()
        }
      }
    }

    render () {
      return <WrappedComponent {...this.props} />
    }
  }

  const mapStateToProps = (state) => ({
    router: state.router,
    ...state.ui
  })

  const mapDispatchToProps = {
    hideModal
  }

  return connect(mapStateToProps, mapDispatchToProps)(Tracker)
}

export default withTracker
