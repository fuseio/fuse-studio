import React from 'react'
import { isMobile } from 'react-device-detect'
import ModalContainer from 'containers/ModalContainer'
import classNames from 'classnames'
import 'scss/main.scss'

const Layout = (props) => {
  let mainContainerClass = classNames({
    'main-container': true,
    'flex': true,
    'column': true
  })

  const mainWrapperClass = classNames({
    'flex': true,
    'column': true,
    'center': true,
    'fullscreen': !isMobile,
    'mobile-screen': isMobile
  })

  return <div className={mainWrapperClass}>
    <div className={mainContainerClass}>
      {props.children}
      <ModalContainer />
    </div>
  </div>
}

export default Layout
