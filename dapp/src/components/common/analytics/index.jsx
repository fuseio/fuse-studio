import { useEffect } from 'react'
import ReactGA from 'react-ga'

// fires a GA pageview every time the route changes
const GoogleAnalyticsReporter = ({ location: { pathname, search } }) => {
  useEffect(() => {
    ReactGA.pageview(`${pathname}${search}`)
  }, [pathname, search])
  return null
}

export default GoogleAnalyticsReporter
