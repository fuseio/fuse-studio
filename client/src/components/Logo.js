import React from 'react'
import EntityHeader from 'images/entity_logo.png'

const Logo = ({showHomePage}) =>
  <div onClick={showHomePage}>
    <img src={EntityHeader} />
    fuse
  </div>

export default Logo
