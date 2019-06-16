import React from 'react'
import classNames from 'classnames'

export default ({ title, children, action, actionTitle, withDecoration = true }) => {
  return (
    <div className={classNames('content_box', { 'content_box--border_shadow_color': withDecoration })}>
      <h3 className='content_box__title'>{title}</h3>
      <div className='content_box__content'>{children}</div>
      <div className='content_box__action' onClick={action}>{actionTitle}</div>
    </div>
  )
}
