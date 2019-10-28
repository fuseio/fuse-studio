import React from 'react'
import { connect } from 'react-redux'
import Plugin from 'components/dashboard/components/Plugin'
import { loadModal } from 'actions/ui'
import { PLUGIN_INFO_MODAL } from 'constants/uiConstants'
import { addCommunityPlugin } from 'actions/community'
import isEmpty from 'lodash/isEmpty'
import upperCase from 'lodash/upperCase'
import lowerCase from 'lodash/lowerCase'
import upperFirst from 'lodash/upperFirst'
import useSwitchNetwork from 'hooks/useSwitchNetwork'
import Puzzle from 'images/puzzle.svg'
import JoinBonus from 'images/join_bonus.png'
import JoinBonusBig from 'images/join_bonus_big.png'
import BusinessList from 'images/business_list.png'
import BusinessListBig from 'images/business_list_big.png'
import Bounty from 'images/bounty.png'
import BountyBig from 'images/bounty_big.png'
import Moonpay from 'images/moonpay.png'
import Ramp from 'images/ramp.png'
import Coindirect from 'images/coindirect.png'
import Carbon from 'images/carbon.png'
import Wyre from 'images/wyre.png'

const generalPlugins = ([
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

const onRampPluginItems = ([
  {
    title: 'Moonpay',
    subTitle: ' | Top up account!',
    coverImage: Moonpay,
    key: 'moonpay'
  },
  {
    title: 'Ramp',
    subTitle: ' | Top up account!',
    coverImage: Ramp,
    key: 'ramp'
  },
  {
    title: 'Coindirect',
    subTitle: ' | Top up account!',
    coverImage: Coindirect,
    key: 'coindirect'
  },
  {
    title: 'Carbon',
    subTitle: ' | Top up account!',
    coverImage: Carbon,
    key: 'carbon'
  },
  {
    title: 'Wyre',
    subTitle: ' | Top up account!',
    coverImage: Wyre,
    key: 'wyre'
  }
])

const Plugins = ({
  loadModal,
  addCommunityPlugin,
  community
}) => {
  useSwitchNetwork('fuse', { featureName: 'plug-ins' })
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
    addCommunityPlugin(communityAddress, plugin)
  }

  const togglePlugin = (name) => {
    return { name }
    // if (key === 'joinBonus' && !isEmpty(plugins && plugins[key])) {
    //   return ({ [key]: { isActive: plugins && plugins[key] ? !plugins[key].isActive : true, joinInfo: null } })
    // }

    // return ({ [key]: { isActive: plugins && plugins[key] ? !plugins[key].isActive : true } })
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
              generalPlugins.map(({
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
                    hasPlugin={plugins && !!plugins[key]}
                    image={coverImage}
                    managePlugin={() => addPlugin(togglePlugin(key))}
                  />
                )
              })
            }
          </div>
        </div>
        <div className='plugins__items__wrapper'>
          <h5 className='plugins__items__title'>Fiat On-ramp</h5>
          <div className='plugins__items'>
            {
              onRampPluginItems.map(({
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
                    hasPlugin={plugins && !!plugins[key]}
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

const mapStateToProps = (state) => ({
  homeNetwork: state.network.homeNetwork
})

const mapDispatchToProps = {
  loadModal,
  addCommunityPlugin
}

export default connect(mapStateToProps, mapDispatchToProps)(Plugins)
