import React, { useState, useEffect } from 'react'
import Logo from 'components/common/Logo'
import { observer, inject } from 'mobx-react'
import { useStore } from 'mobxStore'
import { useDispatch } from 'react-redux'
import { useParams, withRouter } from 'react-router'
import { push } from 'connected-react-router'
import SideBarItems from 'constants/sideBarItems'
import allPlugins from 'constants/plugins'

import isEmpty from 'lodash/isEmpty'
import pickBy from 'lodash/pickBy'
import { toJS } from 'mobx'

import MenuItem from './MenuItem'

const Sidebar = ({
  match,
  location
}) => {
  const { address: communityAddress } = useParams()
  const { dashboard } = useStore()
  console.log({ Sidebar: toJS(dashboard?.plugins) })
  const dispatch = useDispatch()
  const [currentPath, setPath] = useState('')
  const [sideBarItems, setSideBarItems] = useState([])
  // const [addedPlugins, setAddedPlugins] = useState([])

  // useEffect(() => {
  //   if (dashboard?.plugins) {
  //     setAddedPlugins(Object.keys(pickBy(dashboard?.plugins, (pluginKey) => pluginKey && !pluginKey.isRemoved)).sort())
  //   }
  //   return () => { }
  // }, [dashboard?.plugins])

  useEffect(() => {
    setSideBarItems(SideBarItems(dashboard?.isAdmin, !isEmpty(dashboard?.plugins), dashboard?.homeToken?.tokenType).filter(Boolean))
    // setAddedPlugins(Object.keys(pickBy(dashboard?.plugins, (pluginKey) => pluginKey && !pluginKey.isRemoved)).sort())
    return () => { }
  }, [dashboard?.isAdmin, dashboard?.homeToken?.tokenType, dashboard?.plugins])

  console.log({ addedPlugins: dashboard?.addedPlugins })
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
    dispatch(push(path))
  }

  return (
    <aside className='sidebar__container'>
      <div className='sidebar'>
        <div className='item' style={{ cursor: 'pointer' }}>
          <Logo showHomePage={() => goToPage('/')} isGradientLogo />
        </div>
        {
          sideBarItems.map(({
            icon,
            name,
            url,
            style,
            path,
            selectedIcon,
            CustomElement,
            moreIcon
          }) => {
            if (path === '/plugins' && !isEmpty(dashboard?.addedPlugins)) {
              return (
                <div
                  key={name}
                  style={{ ...style, paddingTop: '10px', paddingBottom: '10px' }}
                >
                  <div className='plugin__header'>
                    <span className='title'>Plugins</span>
                    {
                      dashboard?.isAdmin && (
                        <div
                          className='manage'
                          onClick={() => {
                            goToPage(url(match.url))
                            setPath(path)
                          }}
                        >Manage
                        </div>
                      )
                    }
                  </div>
                  {
                    dashboard?.addedPlugins?.map((plugin) => {
                      const myPlugins = allPlugins(dashboard?.isAdmin)
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
                              goToPage(url(match.url))
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
                      goToPage(url(match.url))
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
                  viewPage={() => {
                    goToPage(url(match.url))
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

export default withRouter(observer(Sidebar))
