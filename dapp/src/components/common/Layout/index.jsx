import React from 'react'
import { isMobile } from 'react-device-detect'
import ModalContainer from 'containers/ModalContainer'
import 'scss/main.scss'

export default (props) => (
  <div style={isMobile ? { WebkitOverflowScrolling: 'touch', height: '100%' } : {}}>
    {props.children}
    <ModalContainer />
  </div>
)
