import React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'

const MenuItem = observer(({
  style,
  viewPage,
  isCurrentPath,
  name,
  selectedIcon,
  icon,
  moreIcon
}) => {
  const { dashboard } = useStore()
  return (
    <div
      style={style}
      onClick={viewPage}
      className={classNames('item item--hover', { 'item--home': isCurrentPath })}
    >
      <span className='item__icon'><img src={isCurrentPath ? selectedIcon : icon} /></span>
      <span className='item__text'>{name === 'economy' ? `${dashboard?.community?.name} ${name}` : name}</span>
      {moreIcon && <div style={{ marginLeft: 'auto' }}>{moreIcon && <img src={isCurrentPath ? moreIcon.AddYellowIcon : moreIcon.AddIcon} />}</div>}
    </div>
  )
})

export default MenuItem
