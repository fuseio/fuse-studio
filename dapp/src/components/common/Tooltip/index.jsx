import React, { Fragment } from 'react'
import ReactTooltip from 'react-tooltip'

const Tooltip = ({ children, ...props }) => {
  return (
    <Fragment>
      <ReactTooltip {...props} type='info'>
        {children}
      </ReactTooltip>
    </Fragment>
  )
}

export default Tooltip
