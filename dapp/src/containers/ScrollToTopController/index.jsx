import React from 'react'
import { withRouter } from 'react-router'

const ScrollToTopController = ({ children, location: { pathname } }) => {
  React.useEffect(() => {
    try {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    } catch (error) {
      window.scrollTo(0, 0)
    }
    return () => {}
  }, [pathname])

  return children || null
}

export default withRouter(ScrollToTopController)
