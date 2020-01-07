import React, { useState, useEffect } from 'react'
import Logo from 'components/common/Logo'
import { useParams } from 'react-router'
import SideBarItems from 'constants/sideBarItems'
import allPlugins from 'constants/plugins'

import isEmpty from 'lodash/isEmpty'
import pickBy from 'lodash/pickBy'
import { push } from 'connected-react-router'
import { connect } from 'react-redux'
import { getForeignTokenByCommunityAddress } from 'selectors/token'

import { checkIsAdmin, getCommunityAddress } from 'selectors/entities'
import { getCurrentCommunity } from 'selectors/dashboard'

import MenuItem from './MenuItem'

const Sidebar = ({
  match,
  isAdmin,
  token,
  location,
  push,
  community
}) => {
  const { address: communityAddress } = useParams()
  const [currentPath, setPath] = useState('')
  const [sideBarItems, setSideBarItems] = useState([])
  const [addedPlugins, setAddedPlugins] = useState([])

  useEffect(() => {
    if (!isEmpty(community && community.plugins)) {
      setAddedPlugins(Object.keys(pickBy(community && community.plugins, (pluginKey) => pluginKey && !pluginKey.isRemoved)).sort())
    }
    return () => { }
  }, [community])

  useEffect(() => {
    setSideBarItems(SideBarItems(isAdmin, !isEmpty(community && community.plugins), token && token.tokenType).filter(Boolean))
    setAddedPlugins(Object.keys(pickBy(community && community.plugins, (pluginKey) => pluginKey && !pluginKey.isRemoved)).sort())
    return () => { }
  }, [isAdmin, token.tokenType])

  useEffect(() => {
    const paramsArr = location.pathname.split('/')
    const lastItem = paramsArr[paramsArr.length - 1]
    if (paramsArr[paramsArr.length - 2] === 'onramp') {
      setPath(`/${paramsArr[paramsArr.length - 2]}/${lastItem}`)
    } else if (((communityAddress) !== lastItem) && lastItem !== 'justCreated') {
      setPath(`/${lastItem}`)
    } else {
      setPath('')
    }
    return () => { }
  }, [location.pathname])

  const goToPage = (path) => {
    push(path)
  }

  return (
    <aside className='sidebar__container'>
      <div className='sidebar'>
        <div className='item' style={{ cursor: 'pointer' }}>
          <Logo showHomePage={() => goToPage('/')} isGradientLogo />
        </div>
        {
          !community ? (
            null
          ) : sideBarItems.map(({
            icon,
            name,
            url,
            style,
            path,
            selectedIcon,
            CustomElement,
            moreIcon
          }) => {
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
                      const myPlugins = allPlugins(isAdmin)
                      if (plugin && myPlugins[plugin] && !myPlugins[plugin].isRemoved) {
                        const {
                          name,
                          path,
                          url,
                          icon,
                          selectedIcon
                        } = myPlugins[plugin]
                        return (
                          <MenuItem
                            key={name}
                            isCurrentPath={currentPath === path}
                            icon={icon}
                            selectedIcon={selectedIcon}
                            name={name}
                            viewPage={() => {
                              goToPage(url(match))
                              setPath(path)
                            }}
                          />
                        )
                      }
                    })
                  }
                </div>
              )
            } else if (CustomElement) {
              return (
                <CustomElement key={name} style={style}>
                  <MenuItem
                    key={name}
                    isCurrentPath={currentPath === path}
                    name={name}
                    icon={icon}
                    selectedIcon={selectedIcon}
                    viewPage={() => {
                      goToPage(url(match))
                      setPath(path)
                    }}
                  />
                </CustomElement>
              )
            } else {
              return (
                <MenuItem
                  key={name}
                  style={style}
                  isCurrentPath={currentPath === path}
                  icon={icon}
                  name={name}
                  selectedIcon={selectedIcon}
                  moreIcon={moreIcon}
                  communityName={community && community.name}
                  viewPage={() => {
                    goToPage(url(match))
                    setPath(path)
                  }}
                />
              )
            }
          })
        }
      </div>
    </aside>
  )
}

const mapState = (state) => ({
  isAdmin: checkIsAdmin(state),
  location: state.router.location,
  community: getCurrentCommunity(state, getCommunityAddress(state)),
  token: getForeignTokenByCommunityAddress(state, getCommunityAddress(state)) || { tokenType: '' }
})

export default connect(mapState, {
  push
})(Sidebar)
