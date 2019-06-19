import React, { useState } from 'react'
import Logo from 'components/common/Logo'
import HomeIcon from 'images/home.svg'
import HomeYellowIcon from 'images/home_yellow.svg'
import WalletIcon from 'images/wallet_new.svg'
import WalletYellowIcon from 'images/wallet_new_yellow.svg'
import BusinessIcon from 'images/business_list.svg'
import BusinessYellowIcon from 'images/business_list_yellow.svg'
import UsersIcon from 'images/user_list.svg'
import UsersYellowIcon from 'images/user_list_yellow.svg'
import classNames from 'classnames'
import { Link } from 'react-router-dom'

const sidebarItems = [
  {
    name: 'community',
    path: '',
    url: (match) => `${match}`,
    icon: HomeIcon,
    style: {
      borderTop: '.5px solid rgba(222, 222, 222, 0.2)'
    },
    selectedIcon: HomeYellowIcon
  },
  {
    name: 'Business list',
    path: '/merchants',
    url: (match) => `${match}/merchants`,
    icon: BusinessIcon,
    style: {
      borderTop: '.5px solid rgba(222, 222, 222, 0.2)'
    },
    selectedIcon: BusinessYellowIcon
  },
  {
    name: 'Users list',
    path: '/users',
    url: (match) => `${match}/users`,
    icon: UsersIcon,
    selectedIcon: UsersYellowIcon
  },
  {
    name: 'White label wallet',
    path: '/wallet',
    url: (match) => `${match}/wallet`,
    icon: WalletIcon,
    style: {
      borderBottom: '.5px solid rgba(222, 222, 222, 0.2)'
    },
    selectedIcon: WalletYellowIcon
  }
]

export default ({ communityName, match, isGradientLogo }) => {
  const [currentPath, setPath] = useState('')
  return (
    <aside className='sidebar'>
      <div className='item' style={{ cursor: 'pointer' }}>
        <Link to='/'>
          <Logo isGradientLogo={isGradientLogo} />
        </Link>
      </div>
      {sidebarItems.map(({ icon, name, url, style, path, selectedIcon }) => {
        return (
          <Link
            key={name}
            style={style}
            to={url(match)}
            onClick={() => setPath(path)}
            className={classNames('item item--hover', { 'item--home': currentPath === path })}
          >
            <span className='item__icon'><img src={currentPath === path ? selectedIcon : icon} /></span>
            <span className='item__text'>{name === 'community' ? `${communityName} ${name}` : name}</span>
          </Link>
        )
      })}
    </aside>
  )
}
