import React from 'react'
import { connect } from 'react-redux'
import { useParams } from 'react-router'
import Plugin from 'components/dashboard/components/Plugin'
import { loadModal } from 'actions/ui'
import { PLUGIN_INFO_MODAL } from 'constants/uiConstants'
import { addCommunityPlugin } from 'actions/community'
import Puzzle from 'images/puzzle.svg'
import JoinBonus from 'images/join_bonus.png'
import JoinBonusBig from 'images/join_bonus_big.png'
import BusinessList from 'images/business_list.png'
import BusinessListBig from 'images/business_list_big.png'
import FiatOnRamp from 'images/fiat-on-ramp.png'
import FiatOnRampBig from 'images/fiat-on-ramp-big.png'
import WalletBannerLink from 'images/wallet_banner_link.png'
import WalletBannerLinkBig from 'images/wallet_banner_link_big.png'
import { useEffect } from 'react'
import { setDefault, isOwner } from 'actions/owner'

const generalPlugins = ([
  {
    title: 'Business list',
    coverImage: BusinessList,
    modalCoverPhoto: BusinessListBig,
    key: 'businessList',
    content: `The business list allows to you integrate new businesses into your economy. Once a business is added they will appear in the mobile wallet and users will be able to transact with them freely.`
  },
  {
    title: 'Wallet banner link',
    coverImage: WalletBannerLink,
    disabled: false,
    modalCoverPhoto: WalletBannerLinkBig,
    content: `The wallet banner plug-in allows you to customize your wallet by adding an image and hyperlink of your choice to your wallet.`,
    key: 'walletBanner'
  },
  {
    title: 'Bonuses',
    coverImage: JoinBonus,
    modalCoverPhoto: JoinBonusBig,
    key: 'bonuses',
    content: `This plugin gives you the ability to reward users for completing multiple different actions. Join your economy, invite their friends or backup their wallet are all actions that can be rewarded with tokens.`
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
  }
])

const PluginList = ({ pluginList, pluginTile, plugins, showInfoModal, addPlugin, togglePlugin }) => {
  return (
    <div className='plugins__items__wrapper'>
      <h5 className='plugins__items__title'>{pluginTile}</h5>
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
                modifier={pluginTile.includes('Fiat')}
                key={title}
                subTitle={subTitle}
                disabled={disabled}
                title={title}
                hasPlugin={plugins && plugins[key] && !plugins[key].isRemoved}
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

const Plugins = ({
  address,
  isAdmin,
  isOwner,
  communityCreator,
  loadModal,
  addCommunityPlugin,
  community
}) => {
  const dispatch = useDispatch()
  const { address: communityAddress } = useParams()
  const { plugins } = community
  const showInfoModal = (key, props) => {
    loadModal(PLUGIN_INFO_MODAL, {
      ...props,
      pluginName: key,
      hasPlugin: plugins && plugins[key] ? plugins[key] : false,
      managePlugin: () => addPlugin(togglePlugin(key))
    })
  }

  const handleTracker = (plugin) => {
    if (window && window.analytics) {
      const { name } = plugin
      window.analytics.track(`plugin ${plugin.isRemoved ? 'removed' : 'added'}`, { name })
    }
  }

  const addPlugin = (plugin) => {
    handleTracker(plugin)
    addCommunityPlugin(communityAddress, plugin)
  }

  const togglePlugin = (key) => {
    const plugin = { name: key }
    if (key === 'businessList') {
      plugin.isActive = true
    } else {
      plugin.isActive = false
    }
    if (plugins) {
      if (plugins[key] && plugins[key].isRemoved) {
        plugin.isRemoved = false
      } else if (plugins[key] && !plugins[key].isRemoved) {
        plugin.isRemoved = true
      }
    }
    return plugin
  }

  useEffect(()=>{
    dispatch(isOwner(communityAddress, address))
    if(isOwner && !isAdmin){
      loadModal(SWITCH_ACCOUNT_MODAL), {
        ...props,
      })
    }
  
    return () =>{
      dispatch(setDefault)
    }
  }, [dispatch])

  return (
    community ? <div className='plugins'>
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
        <PluginList pluginList={generalPlugins} pluginTile={'Choose the plugin you want to add'} plugins={plugins} showInfoModal={showInfoModal} addPlugin={addPlugin} togglePlugin={togglePlugin} />
      </div>
    </div> : <div />
  )
}

const mapDispatchToProps = {
  loadModal,
  addCommunityPlugin
}

const mapStateToProps = (state) => ({
  address: getAccountAddress(state)

})


export default connect(mapStateToProps, mapDispatchToProps)(Plugins)
