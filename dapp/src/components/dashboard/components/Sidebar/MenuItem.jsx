import React, { memo } from 'react'
import classNames from 'classnames'

const MenuItem = memo(({
  style,
  viewPage,
  isCurrentPath,
  name,
  communityName,
  selectedIcon,
  icon,
  moreIcon
}) => {
  return (
    <div
      style={style}
      onClick={viewPage}
      className={classNames('item item--hover', { 'item--home': isCurrentPath })}
    >
      <span className='item__icon'><img src={isCurrentPath ? selectedIcon : icon} /></span>
      <span className='item__text'>{name === 'economy' ? `${communityName} ${name}` : name}</span>
      {moreIcon && <div style={{ marginLeft: 'auto' }}>{moreIcon && <img src={isCurrentPath ? moreIcon.AddYellowIcon : moreIcon.AddIcon} />}</div>}
    </div>
  )
}, (prevProps, nextProps) => {
  if (prevProps.isCurrentPath !== nextProps.isCurrentPath) {
    return false
  }
  if (prevProps.communityName !== nextProps.communityName) {
    return false
  }

  return true
})

export default MenuItem
