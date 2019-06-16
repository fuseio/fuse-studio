import React from 'react'
import GradientLogo from 'images/fuse-logo.svg'
import BlueLogo from 'images/fuse_logo_blue.svg'
import WhiteLogo from 'images/fuse_logo_white.svg'

const Logo = ({ showHomePage, isBlue = false, isGradientLogo = false, ...rest }) =>
  <div onClick={showHomePage} {...rest}>
    <img
      src={isGradientLogo
        ? GradientLogo
        : !isBlue
          ? WhiteLogo
          : BlueLogo
      }
    />
  </div>

export default Logo
