import React from 'react'
import LogoImg from 'images/fuse-logo.svg'

const Logo = ({showHomePage}) =>
  <div onClick={showHomePage}>
    <img src={LogoImg} />
  </div>

export default Logo
