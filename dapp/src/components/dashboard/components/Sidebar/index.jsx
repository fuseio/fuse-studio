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
import DollarIcon from 'images/dollar_symbol.svg'
import DollarYellowIcon from 'images/dollar_symbol_yellow.svg'
import UsersYellowIcon from 'images/user_list_yellow.svg'
import classNames from 'classnames'
import isEmpty from 'lodash/isEmpty'
import pickBy from 'lodash/pickBy'
import { push } from 'connected-react-router'
import { connect } from 'react-redux'

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

const allPlugins = (isAdmin) => isAdmin ? ({
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
  },
  moonpay: {
    name: 'Moonpay',
    path: '/onramp/moonpay',
    url: (match) => `${match}/onramp/moonpay`,
    icon: DollarIcon,
    selectedIcon: DollarYellowIcon
  },
  ramp: {
    name: 'Ramp',
    path: '/onramp/ramp',
    url: (match) => `${match}/onramp/ramp`,
    icon: DollarIcon,
    selectedIcon: DollarYellowIcon
  },
  coindirect: {
    name: 'Coindirect',
    path: '/onramp/coindirect',
    url: (match) => `${match}/onramp/coindirect`,
    icon: DollarIcon,
    selectedIcon: DollarYellowIcon
  },
  wyre: {
    name: 'Wyre',
    path: '/onramp/wyre',
    url: (match) => `${match}/onramp/wyre`,
    icon: DollarIcon,
    selectedIcon: DollarYellowIcon
  }
}) : ({
  businessList: {
    name: 'Business list',
    path: '/merchants',
    url: (match) => `${match}/merchants`,
    icon: BusinessIcon,
    selectedIcon: BusinessYellowIcon
  }
})

const Sidebar = ({
  communityAddress,
  communityName,
  match,
  isAdmin,
  isGradientLogo,
  plugins,
  tokenType,
  location,
  push
}) => {
  const [currentPath, setPath] = useState('')
  const [sideBarItems, setSideBarItems] = useState([])
  const [addedPlugins, setAddedPlugins] = useState([])

  useEffect(() => {
    setSideBarItems(getSideBarItems(isAdmin, !isEmpty(plugins), tokenType).filter(Boolean))
    setAddedPlugins(Object.keys(pickBy(plugins, (pluginKey) => pluginKey && !pluginKey.isRemoved)).sort())
    return () => {}
  }, [])

  useEffect(() => {
    setAddedPlugins(Object.keys(pickBy(plugins, (pluginKey) => pluginKey && !pluginKey.isRemoved)).sort())
    return () => {}
  }, [plugins])

  useEffect(() => {
    setSideBarItems(getSideBarItems(isAdmin, !isEmpty(plugins), tokenType).filter(Boolean))
    setAddedPlugins(Object.keys(pickBy(plugins, (pluginKey) => pluginKey && !pluginKey.isRemoved)).sort())
    return () => {}
  }, [isAdmin, tokenType])

  useEffect(() => {
    const paramsArr = location.pathname.split('/')
    const lastItem = paramsArr[paramsArr.length - 1]
    if (paramsArr[paramsArr.length - 2] === 'onramp') {
      setPath(`/${paramsArr[paramsArr.length - 2]}/${lastItem}`)
    } else if ((communityAddress !== lastItem) && lastItem !== 'justCreated') {
      setPath(`/${lastItem}`)
    } else {
      setPath('')
    }
    return () => {}
  }, [location.pathname])

  const goToPage = (path) => {
    push(path)
  }

  return (
    <aside className='sidebar'>
      <div className='item' style={{ cursor: 'pointer' }}>
        <span onClick={() => goToPage('/')}>
          <Logo isGradientLogo={isGradientLogo} />
        </span>
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
                    <div
                      className='manage'
                      onClick={() => {
                        goToPage(url(match))
                        setPath(path)
                      }}
                    >Manage</div>
                  )
                }
              </div>
              {
                addedPlugins.map((plugin) => {
                  const allPlugins1 = allPlugins(isAdmin)
                  if (plugin && allPlugins1[plugin] && !allPlugins1[plugin].isRemoved) {
                    const {
                      name,
                      path,
                      url,
                      icon,
                      selectedIcon
                    } = allPlugins1[plugin]
                    return (
                      <div
                        key={name}
                        onClick={() => {
                          goToPage(url(match))
                          setPath(path)
                        }}
                        className={classNames('item item--hover', { 'item--home': currentPath === path })}
                      >
                        <span className='item__icon'><img src={currentPath === path ? selectedIcon : icon} /></span>
                        <span className='item__text'>{name}</span>
                      </div>
                    )
                  }
                })
              }
            </div>
          )
        } else if (CustomElement) {
          return (
            <CustomElement key={name} style={style}>
              <div
                key={name}
                to={url(match)}
                onClick={() => {
                  goToPage(url(match))
                  setPath(path)
                }}
                className={classNames('item item--hover', { 'item--home': currentPath === path })}
              >
                <span className='item__icon'><img src={currentPath === path ? selectedIcon : icon} /></span>
                <span className='item__text'>{name === 'community' ? `${communityName} ${name}` : name}</span>
              </div>
            </CustomElement>
          )
        } else {
          return (
            <div
              key={name}
              style={style}
              onClick={() => {
                goToPage(url(match))
                setPath(path)
              }}
              className={classNames('item item--hover', { 'item--home': currentPath === path })}
            >
              <span className='item__icon'><img src={currentPath === path ? selectedIcon : icon} /></span>
              <span className='item__text'>{name === 'community' ? `${communityName} ${name}` : name}</span>
              {moreIcon && <img src={currentPath === path ? moreIcon.AddYellowIcon : moreIcon.AddIcon} /> }
            </div>
          )
        }
      })}
    </aside>
  )
}

export default connect(null, { push })(Sidebar)
