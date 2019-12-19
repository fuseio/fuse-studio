import React from 'react'
// import SettingsIcon from 'images/settings.svg'
import UsersIcon from 'images/user_list.svg'
import UsersYellowIcon from 'images/user_list_yellow.svg'
import TransferIcon from 'images/transfer.svg'
import TransferYellowIcon from 'images/transfer-selected.svg'
import MintBurnYellowIcon from 'images/mint-burn-selected.svg'
import MintBurnIcon from 'images/mint-burn.svg'
import AddIcon from 'images/add-selected.png'
import AddYellowIcon from 'images/add-selected.svg'
import PluginYellowIcon from 'images/plugin-selected.svg'
import HomeIcon from 'images/home.svg'
import HomeYellowIcon from 'images/home_yellow.svg'
import WalletIcon from 'images/wallet_new.svg'
import WalletYellowIcon from 'images/wallet_new_yellow.svg'
import PluginIcon from 'images/plugin.svg'

const sideBarItems = (isAdmin, hasPlugins, tokenType) => isAdmin ? ([
  {
    name: 'community',
    path: '',
    url: (match) => `${match}`,
    icon: HomeIcon,
    style: !hasPlugins ? {
      borderTop: '.5px solid rgba(222, 222, 222, 0.2)'
    } : {
      borderTop: '.5px solid rgba(222, 222, 222, 0.2)',
      borderBottom: '.5px solid rgba(222, 222, 222, 0.2)'
    },
    selectedIcon: HomeYellowIcon
  },
  {
    name: 'Plug-in store',
    path: '/plugins',
    url: (match) => `${match}/plugins`,
    icon: PluginIcon,
    style: {
      borderTop: '.5px solid rgba(222, 222, 222, 0.2)',
      borderBottom: '.5px solid rgba(222, 222, 222, 0.2)'
    },
    selectedIcon: PluginYellowIcon,
    moreIcon: {
      AddIcon,
      AddYellowIcon
    }
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
    selectedIcon: WalletYellowIcon
  },
  {
    name: 'Transfer',
    path: '/transfer',
    url: (match) => `${match}/transfer`,
    icon: TransferIcon,
    style: {
      borderBottom: '.5px solid rgba(222, 222, 222, 0.2)'
    },
    selectedIcon: TransferYellowIcon
  },
  tokenType === 'mintableBurnable' && {
    name: 'Mint / Burn',
    path: '/mintBurn',
    url: (match) => `${match}/mintBurn`,
    icon: MintBurnIcon,
    style: {
      borderTop: '.5px solid rgba(222, 222, 222, 0.2)'
    },
    selectedIcon: MintBurnYellowIcon,
    CustomElement: ({ children }) => (
      <div style={{ paddingBottom: '50px' }}>
        <span className='admin-title'>Admin tools</span>
        {children}
      </div>
    )
  }
  // TODO - Settings page
  // ,
  // {
  //   name: 'Settings',
  //   path: '/settings',
  //   url: (match) => `${match}/settings`,
  //   icon: SettingsIcon,
  //   selectedIcon: SettingsIcon
  // }
]) : ([
  {
    name: 'community',
    path: '',
    url: (match) => `${match}`,
    icon: HomeIcon,
    style: !hasPlugins ? {
      borderTop: '.5px solid rgba(222, 222, 222, 0.2)'
    } : {
      borderTop: '.5px solid rgba(222, 222, 222, 0.2)',
      borderBottom: '.5px solid rgba(222, 222, 222, 0.2)'
    },
    selectedIcon: HomeYellowIcon
  },
  {
    name: 'Plug-in store',
    path: '/plugins',
    url: (match) => `${match}/plugins`,
    icon: PluginIcon,
    style: {
      borderTop: '.5px solid rgba(222, 222, 222, 0.2)',
      borderBottom: '.5px solid rgba(222, 222, 222, 0.2)'
    },
    selectedIcon: PluginYellowIcon,
    moreIcon: {
      AddIcon,
      AddYellowIcon
    }
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
    selectedIcon: WalletYellowIcon
  },
  {
    name: 'Transfer',
    path: '/transfer',
    url: (match) => `${match}/transfer`,
    icon: TransferIcon,
    style: {
      borderBottom: '.5px solid rgba(222, 222, 222, 0.2)'
    },
    selectedIcon: TransferYellowIcon
  }
])

export default sideBarItems
