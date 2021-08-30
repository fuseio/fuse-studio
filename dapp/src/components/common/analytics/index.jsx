import { useEffect } from 'react'
import ReactGA from 'react-ga4'

// fires a GA pageview every time the route changes
const GoogleAnalyticsReporter = ({ location: { pathname, search } }) => {
  useEffect(() => {
  }, [pathname, search])
  ReactGA.send({ hitType: 'pageview', page: `${pathname}${search}` })
  return null
}

export default GoogleAnalyticsReporter
