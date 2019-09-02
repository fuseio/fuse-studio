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
import get from 'lodash/get'
import classNames from 'classnames'
import SwitchNetwork from 'components/common/SwitchNetwork'

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
  onlyOnFuse,
  networkType
}) => {
  const { plugins } = community

  const showInfoModal = (key, props) => {
    loadModal(PLUGIN_INFO_MODAL, {
      ...props,
      hasPlugin: plugins && plugins[key] ? plugins[key] : false,
      managePlugin: () => addPlugin(toggleActive(key, plugins))
    })
  }

  const addPlugin = (plugin) => {
    const { communityAddress } = community
    if (plugin && plugin.joinBonus) {
      const { homeTokenAddress } = community
      onlyOnFuse(() => addCommunityPlugins(communityAddress, plugin, homeTokenAddress))
    } else {
      addCommunityPlugins(communityAddress, plugin)
    }
  }

  const toggleActive = (key, plugins) =>
    get(plugins, 'joinBonus.isActive')
      ? ({ [key]: { isActive: plugins && plugins[key] ? !plugins[key].isActive : true, joinInfo: null } })
      : ({ [key]: { isActive: plugins && plugins[key] ? !plugins[key].isActive : true } })

  return (
    <div className='plugins'>
      <h2 className={classNames('plugins__title', { 'plugins__title--disabled': networkType !== 'fuse' })}>Plugins</h2>
      <h2 className={classNames('plugins__content', { 'plugins__content--disabled': networkType !== 'fuse' })}>
        Plug-ins are contracts deployed on the Fuse-chain and allow to add functionality to your app with a few easy steps.
        Any plug-in you activate will open a new navigation menu that allows to configure it's settings.
        <br /> Give it try.
      </h2>
      <div className={classNames('plugins__items', { 'plugins__items--disabled': networkType !== 'fuse' })}>
        {networkType !== 'fuse' && (
          <SwitchNetwork />
        )}
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
                managePlugin={() => addPlugin(toggleActive(key, plugins))}
              />
            )
          })
        }
      </div>
    </div>
  )
}

const mapDispatchToProps = {
  loadModal,
  addCommunityPlugins
}

export default connect(null, mapDispatchToProps)(Plugins)
