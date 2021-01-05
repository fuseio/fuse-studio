import React from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import Plugin from 'components/FuseDashboard/components/Plugin'
import { loadModal } from 'actions/ui'
import { PLUGIN_INFO_MODAL } from 'constants/uiConstants'
import Puzzle from 'images/puzzle.svg'
import JoinBonus from 'images/join_bonus.png'
import JoinBonusBig from 'images/join_bonus_big.png'
import BusinessList from 'images/business_list.png'
import BusinessListBig from 'images/business_list_big.png'
import FiatOnRamp from 'images/fiat-on-ramp.png'
import FiatOnRampBig from 'images/fiat-on-ramp-big.png'
import WalletBannerLink from 'images/wallet_banner_link.png'
import WalletBannerLinkBig from 'images/wallet_banner_link_big.png'
import { useStore } from 'store/mobx'
import { observer } from 'mobx-react'

const generalPlugins = ([
  {
    title: 'Business list',
    coverImage: BusinessList,
    modalCoverPhoto: BusinessListBig,
    key: 'businessList',
    content: 'The business list allows to you integrate new businesses into your economy. Once a business is added they will appear in the mobile wallet and users will be able to transact with them freely.'
  },
  {
    title: 'Wallet banner link',
    coverImage: WalletBannerLink,
    disabled: false,
    modalCoverPhoto: WalletBannerLinkBig,
    content: 'The wallet banner plug-in allows you to customize your wallet by adding an image and hyperlink of your choice to your wallet.',
    key: 'walletBanner'
  },
  {
    title: 'Bonuses',
    coverImage: JoinBonus,
    modalCoverPhoto: JoinBonusBig,
    key: 'bonuses',
    content: 'This plugin gives you the ability to reward users for completing multiple different actions. Join your economy, invite their friends or backup their wallet are all actions that can be rewarded with tokens.'
  },
  {
    title: 'Fiat on ramp',
    coverImage: FiatOnRamp,
    disabled: false,
    modalCoverPhoto: FiatOnRampBig,
    content: `We have created integration with Moonpay, Transak, fiat gateways that allow you to embed the relevant payment option
      (credit/debit cards and banks wires) inside your app and even show several option for your clients to choose from.
      The integration allows your users to top their account without you holding any custody in the process! Here is how:
      https://www.youtube.com/watch?v=ShxUIljvfLU&feature=emb_title`,
    key: 'onramp'
  },
  {
    title: 'Bridge',
    coverImage: FiatOnRamp,
    disabled: false,
    modalCoverPhoto: FiatOnRampBig,
    content: `We have created integration with Moonpay, Transak, fiat gateways that allow you to embed the relevant payment option
      (credit/debit cards and banks wires) inside your app and even show several option for your clients to choose from.
      The integration allows your users to top their account without you holding any custody in the process! Here is how:
      https://www.youtube.com/watch?v=ShxUIljvfLU&feature=emb_title`,
    key: 'bridge'
  },
  {
    title: 'Fuseswap',
    coverImage: FiatOnRamp,
    disabled: false,
    modalCoverPhoto: FiatOnRampBig,
    content: `We have created integration with Moonpay, Transak, fiat gateways that allow you to embed the relevant payment option
      (credit/debit cards and banks wires) inside your app and even show several option for your clients to choose from.
      The integration allows your users to top their account without you holding any custody in the process! Here is how:
      https://www.youtube.com/watch?v=ShxUIljvfLU&feature=emb_title`,
    key: 'fuseswap'
  }
])

const PluginList = ({ pluginList, showInfoModal, addPlugin, togglePlugin }) => {
  return (
    <div className='plugins__items__wrapper'>
      <h5 className='plugins__items__title'>Choose the plugin you want to add</h5>
      <div className='grid-x grid-margin-x grid-margin-y'>
        {
          pluginList.map(({
            title,
            coverImage,
            disabled,
            subTitle,
            modalCoverPhoto,
            key,
            text,
            content,
            website
          }) => {
            return (
              <Plugin
                text={text}
                key={title}
                subTitle={subTitle}
                disabled={disabled}
                title={title}
                pluginKey={key}
                image={coverImage}
                managePlugin={() => addPlugin(togglePlugin(key))}
                showInfoModal={() => showInfoModal(key, {
                  coverImage: modalCoverPhoto,
                  title,
                  disabled,
                  content,
                  website
                })}
              />
            )
          })
        }
      </div>
    </div>
  )
}

const Plugins = () => {
  const dispatch = useDispatch()
  const { dashboard } = useStore()
  const { address: communityAddress } = useParams()
  const showInfoModal = (key, props) => {
    dispatch(loadModal(PLUGIN_INFO_MODAL, {
      ...props,
      pluginName: key,
      hasPlugin: dashboard?.plugins && dashboard?.plugins[key] ? dashboard?.plugins[key] : false,
      managePlugin: () => addPlugin(togglePlugin(key))
    }))
  }

  const handleTracker = (plugin) => {
    if (window && window.analytics) {
      const { name } = plugin
      window.analytics.track(`plugin ${plugin.isRemoved ? 'removed' : 'added'}`, { name })
    }
  }

  const addPlugin = (plugin) => {
    handleTracker(plugin)
    dashboard.addCommunityPlugin({ communityAddress, plugin })
    console.log({ plugin })
  }

  const togglePlugin = (key) => {
    const plugin = { name: key }
    if (key === 'businessList') {
      plugin.isActive = true
    } else {
      plugin.isActive = false
    }
    if (dashboard?.plugins) {
      if (dashboard?.plugins[key]?.isRemoved) {
        plugin.isRemoved = false
      } else {
        plugin.isRemoved = true
      }
    }
    return plugin
  }

  return (
    <div className='plugins'>
      <h2 className='plugins__title'>Plugins</h2>
      <div className='plugins__wrapper'>
        <div className='plugins__content__wrapper'>
          <div className='plugins__content'>
            Plug-ins are contracts deployed on the Fuse chain that allow you to add functionality to your app with the click of a button.
            Any plug-in you activate will open a new navigation menu that allows you to configure it's settings.
            Give it try!
          </div>
          <div className='plugins__puzzle'><img src={Puzzle} /></div>
        </div>
        <PluginList
          pluginList={generalPlugins}
          showInfoModal={showInfoModal}
          addPlugin={addPlugin} togglePlugin={togglePlugin}
        />
      </div>
    </div>
  )
}

export default observer(Plugins)
