import React from 'react'
import { connect } from 'react-redux'
import Plugin from 'components/dashboard/components/Plugin'
import JoinBonus from 'images/join_bonus.png'
import JoinBonusBig from 'images/join_bonus_big.png'
import BusinessList from 'images/business_list.png'
import BusinessListBig from 'images/business_list_big.png'
import Bounty from 'images/bounty.png'
import BountyBig from 'images/bounty_big.png'
import { loadModal } from 'actions/ui'
import { PLUGIN_INFO_MODAL } from 'constants/uiConstants'
import { addCommunityPlugins } from 'actions/community'
import isEmpty from 'lodash/isEmpty'
import upperCase from 'lodash/upperCase'
import lowerCase from 'lodash/lowerCase'
import upperFirst from 'lodash/upperFirst'
import Puzzle from 'images/puzzle.svg'
import useSwitchNetwork from 'hooks/useSwitchNetwork'

const PluginsItems = ([
  {
    title: 'Business list',
    coverImage: BusinessList,
    modalCoverPhoto: BusinessListBig,
    key: 'businessList'
  },
  {
    title: 'Join bonus',
    coverImage: JoinBonus,
    modalCoverPhoto: JoinBonusBig,
    key: 'joinBonus'
  },
  {
    title: 'Bounty',
    subTitle: ' | Coming soon!',
    coverImage: Bounty,
    disabled: true,
    modalCoverPhoto: BountyBig,
    key: 'bounty'
  }
])

const Plugins = ({
  loadModal,
  addCommunityPlugins,
  community,
  networkType
}) => {
  useSwitchNetwork(networkType)
  const { plugins } = community

  const showInfoModal = (key, props) => {
    loadModal(PLUGIN_INFO_MODAL, {
      ...props,
      hasPlugin: plugins && plugins[key] ? plugins[key] : false,
      managePlugin: () => addPlugin(togglePlugin(key, plugins))
    })
  }

  const handleTracker = (plugin) => {
    if (window && window.analytics) {
      const pluginsValues = Object.values(plugin)[0]
      window.analytics.track(`${upperFirst(lowerCase(upperCase(Object.keys(plugin))))} ${pluginsValues.isActive ? 'added' : 'removed'}`)
    }
  }

  const addPlugin = (plugin) => {
    const { communityAddress } = community
    handleTracker(plugin)
    addCommunityPlugins(communityAddress, plugin)
  }

  const togglePlugin = (key, plugins) => {
    if (key === 'joinBonus' && !isEmpty(plugins[key])) {
      return ({ [key]: { isActive: plugins && plugins[key] ? !plugins[key].isActive : true, joinInfo: null } })
    }

    return ({ [key]: { isActive: plugins && plugins[key] ? !plugins[key].isActive : true } })
  }

  return (
    <div className='plugins'>
      <h2 className='plugins__title'>Plugins</h2>
      <div className='plugins__wrapper'>
        <div className='plugins__content__wrapper'>
          <div className='plugins__content'>
            Plug-ins are contracts deployed on the Fuse-chain and allow to add functionality to your app with a few easy steps.
            Any plug-in you activate will open a new navigation menu that allows to configure it's settings.
            Give it try.
          </div>
          <div className='plugins__puzzle'><img src={Puzzle} /></div>
        </div>
        <div className='plugins__items__wrapper'>
          <h5 className='plugins__items__title'>Choose plug-in you want to add</h5>
          <div className='plugins__items'>
            {
              PluginsItems.map(({
                title,
                coverImage,
                disabled,
                subTitle,
                modalCoverPhoto,
                key
              }) => {
                return (
                  <Plugin
                    showInfoModal={() => showInfoModal(key, { title, coverImage: modalCoverPhoto, disabled })}
                    key={title}
                    subTitle={subTitle}
                    disabled={disabled}
                    title={title}
                    hasPlugin={plugins && plugins[key] ? plugins[key].isActive : false}
                    image={coverImage}
                    managePlugin={() => addPlugin(togglePlugin(key, plugins))}
                  />
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

const mapDispatchToProps = {
  loadModal,
  addCommunityPlugins
}

export default connect(null, mapDispatchToProps)(Plugins)
