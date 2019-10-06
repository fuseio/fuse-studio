import React, { useState, useEffect } from 'react'
import Logo from 'components/common/Logo'
import PluginIcon from 'images/plugin.svg'
import JoinBonusIcon from 'images/join_bonus.svg'
import JoinBonusYellowIcon from 'images/join_bonus_selected.svg'
import AddIcon from 'images/add-selected.png'
import AddYellowIcon from 'images/add-selected.svg'
import PluginYellowIcon from 'images/plugin-selected.svg'
import HomeIcon from 'images/home.svg'
import HomeYellowIcon from 'images/home_yellow.svg'
import WalletIcon from 'images/wallet_new.svg'
import WalletYellowIcon from 'images/wallet_new_yellow.svg'
import BusinessIcon from 'images/business_list.svg'
import BusinessYellowIcon from 'images/business_list_yellow.svg'
import TransferIcon from 'images/transfer.svg'
import TransferYellowIcon from 'images/transfer-selected.svg'
import MintBurnYellowIcon from 'images/mint-burn-selected.svg'
import MintBurnIcon from 'images/mint-burn.svg'
// import SettingsIcon from 'images/settings.svg'
import UsersIcon from 'images/user_list.svg'
import UsersYellowIcon from 'images/user_list_yellow.svg'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import pickBy from 'lodash/pickBy'

const getSideBarItems = (isAdmin, hasPlugins, tokenType) => isAdmin ? ([
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
      <div>
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

const allPlugins = {
  businessList: {
    name: 'Business list',
    path: '/merchants',
    url: (match) => `${match}/merchants`,
    icon: BusinessIcon,
    selectedIcon: BusinessYellowIcon
  },
  joinBonus: {
    name: 'Join bonus',
    path: '/bonus',
    url: (match) => `${match}/bonus`,
    icon: JoinBonusIcon,
    selectedIcon: JoinBonusYellowIcon
  }
}

const Sidebar = ({ communityAddress, communityName, match, isAdmin, isGradientLogo, plugins, tokenType, location }) => {
  const [currentPath, setPath] = useState('')
  const [sideBarItems, setSideBarItems] = useState([])
  const [addedPlugins, setAddedPlugins] = useState([])

  useEffect(() => {
    setSideBarItems(getSideBarItems(isAdmin, !isEmpty(plugins), tokenType).filter(Boolean))
    setAddedPlugins(Object.keys(pickBy(plugins, (pluginKey) => pluginKey && pluginKey.isActive)).sort())
    return () => {}
  }, [])

  useEffect(() => {
    setAddedPlugins(Object.keys(pickBy(plugins, (pluginKey) => pluginKey && pluginKey.isActive)).sort())
    return () => {}
  }, [plugins])

  useEffect(() => {
    setSideBarItems(getSideBarItems(isAdmin, !isEmpty(plugins), tokenType).filter(Boolean))
    setAddedPlugins(Object.keys(pickBy(plugins, (pluginKey) => pluginKey && pluginKey.isActive)).sort())
    return () => {}
  }, [isAdmin, tokenType])

  useEffect(() => {
    const paramsArr = location.pathname.split('/')
    const lastItem = paramsArr[paramsArr.length - 1]
    if ((communityAddress !== lastItem) && lastItem !== 'justCreated') {
      setPath(`/${lastItem}`)
    }
  }, [location.pathname])

  return (
    <aside className='sidebar'>
      <div className='item' style={{ cursor: 'pointer' }}>
        <Link to='/'>
          <Logo isGradientLogo={isGradientLogo} />
        </Link>
      </div>
      {sideBarItems.map(({ icon, name, url, style, path, selectedIcon, CustomElement, moreIcon }) => {
        if (path === '/plugins' && !isEmpty(addedPlugins)) {
          return (
            <div
              key={name}
              style={{ ...style, paddingTop: '10px', paddingBottom: '10px' }}
            >
              <div className='plugin__header'>
                <span className='title'>Plugins</span>
                {
                  isAdmin && (
                    <Link
                      className='manage'
                      to={url(match)}
                      onClick={() => setPath(path)}
                    >Manage</Link>
                  )
                }
              </div>
              {
                addedPlugins.map((plugin) => {
                  if (plugin && allPlugins[plugin]) {
                    const {
                      name,
                      path,
                      url,
                      icon,
                      selectedIcon
                    } = allPlugins[plugin]
                    return (
                      <Link
                        key={name}
                        to={url(match)}
                        onClick={() => setPath(path)}
                        className={classNames('item item--hover', { 'item--home': currentPath === path })}
                      >
                        <span className='item__icon'><img src={currentPath === path ? selectedIcon : icon} /></span>
                        <span className='item__text'>{name}</span>
                      </Link>
                    )
                  }
                })
              }
            </div>
          )
        } else if (CustomElement) {
          return (
            <CustomElement key={name} style={style}>
              <Link
                key={name}
                to={url(match)}
                onClick={() => setPath(path)}
                className={classNames('item item--hover', { 'item--home': currentPath === path })}
              >
                <span className='item__icon'><img src={currentPath === path ? selectedIcon : icon} /></span>
                <span className='item__text'>{name === 'community' ? `${communityName} ${name}` : name}</span>
              </Link>
            </CustomElement>
          )
        } else {
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
              {moreIcon && <img src={currentPath === path ? moreIcon.AddYellowIcon : moreIcon.AddIcon} /> }
            </Link>
          )
        }
      })}
    </aside>
  )
}

export default Sidebar
