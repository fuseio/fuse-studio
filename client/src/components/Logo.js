import React from 'react'
import LogoImg from 'images/fuse-logo.svg'

const Logo = ({ showHomePage, ...rest }) =>
  <div onClick={showHomePage} {...rest}>
    <img src={LogoImg} />
  </div>

export default Logo
