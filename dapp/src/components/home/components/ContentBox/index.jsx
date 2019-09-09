import React from 'react'
import classNames from 'classnames'
import arrow from 'images/arrow_3.svg'

export default ({ subTitle, title, children, action, actionTitle, subTitleAction, withDecoration = true }) => {
  return (
    <div className={classNames('content_box', { 'content_box--border_shadow_color': withDecoration })}>
      <div className='content_box__title__wrapper'>
        <h3 className='content_box__title'>{title}</h3>
        <h3 className='content_box__title content_box__title--underline' onClick={subTitleAction}>{subTitle}</h3>
      </div>
      <div className='content_box__content'>{children}</div>
      <div className='content_box__action' onClick={action}>{actionTitle} <img src={arrow} alt='arrow' /></div>
    </div>
  )
}
