import React from 'react'
import Logo from 'components/Logo'
import HomeIcon from 'images/home.svg'
import WalletIcon from 'images/wallet_new.svg'
import BusinessIcon from 'images/business_list.svg'
import UsersIcon from 'images/user_list.svg'

const sidebarItems = [
  {
    name: 'Starbucks community',
    url: '/',
    icon: HomeIcon,
    style: {
      borderTop: '.5px solid #d6d6d6'
    }
  },
  {
    name: 'Business list',
    url: '/',
    icon: BusinessIcon,
    style: {
      borderTop: '.5px solid #d6d6d6'
    }
  },
  {
    name: 'Users list',
    url: '/',
    icon: UsersIcon
  },
  {
    name: 'White label wallet',
    url: '/',
    icon: WalletIcon,
    style: {
      borderBottom: '.5px solid #d6d6d6'
    }
  }
]

export default () => {
  return (
    <aside className='sidebar'>
      <div className='item'><Logo /></div>
      {sidebarItems.map(({ id, icon, name, url, style }) => {
        return (
          <div className='item' key={name} style={style}>
            <span className='item__icon'><img src={icon} /></span>
            <span className='item__text'>{name}</span>
          </div>
        )
      })}
    </aside>
  )
}
