import React from 'react'
import Logo from 'components/common/Logo'
import HomeIcon from 'images/home.svg'
import WalletIcon from 'images/wallet_new.svg'
import BusinessIcon from 'images/business_list.svg'
import UsersIcon from 'images/user_list.svg'
import classNames from 'classnames'
import { Link } from 'react-router-dom'

const sidebarItems = [
  {
    name: 'community',
    url: '',
    icon: HomeIcon,
    style: {
      borderTop: '.5px solid rgba(222, 222, 222, 0.2)'
    }
  },
  {
    name: 'Business list',
    url: '/merchants',
    icon: BusinessIcon,
    style: {
      borderTop: '.5px solid rgba(222, 222, 222, 0.2)'
    }
  },
  {
    name: 'Users list',
    url: '/users',
    icon: UsersIcon
  },
  {
    name: 'White label wallet',
    url: '/wallet',
    icon: WalletIcon,
    style: {
      borderBottom: '.5px solid rgba(222, 222, 222, 0.2)'
    }
  }
]

export default ({ communityName, match, isGradientLogo }) => (
  <aside className='sidebar'>
    <div className='item' style={{ cursor: 'pointer' }}><Link to='/'><Logo isGradientLogo={isGradientLogo} /></Link></div>
    {sidebarItems.map(({ icon, name, url, style }, index) => {
      return (
        <Link to={`${match}${url}`} className={classNames('item item--hover', { 'item--home': index === 0 })} key={name} style={style}>
          <span className='item__icon'><img src={icon} /></span>
          <span className='item__text'>{name === 'community' ? `${communityName} ${name}` : name}</span>
        </Link>
      )
    })}
  </aside>
)
