import React from 'react'
import { connect } from 'react-redux'
import { useParams } from 'react-router'
import Plugin from 'components/dashboard/components/Plugin'
import { loadModal } from 'actions/ui'
import { PLUGIN_INFO_MODAL } from 'constants/uiConstants'
import { addCommunityPlugin } from 'actions/community'
import upperCase from 'lodash/upperCase'
import lowerCase from 'lodash/lowerCase'
import upperFirst from 'lodash/upperFirst'
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
import { getCurrentCommunity } from 'selectors/dashboard'
import { getCommunityAddress } from 'selectors/entities'

const generalPlugins = ([
  {
    title: 'Business list',
    coverImage: BusinessList,
    modalCoverPhoto: BusinessListBig,
    key: 'businessList',
    content: `The business list allows to add new businesses to the community contract with all the meta-data of the business. After adding a business trough the interface your users will see the business list on their phone after switching to your community.`
  },
  {
    title: 'Join bonus',
    coverImage: JoinBonus,
    modalCoverPhoto: JoinBonusBig,
    key: 'joinBonus',
    content: `The join bonus is contract of a funder account that rewards your new users with your token. The join bonus adds a new funder account address in your user list and opens a new menu item on the left where you can send the funder some tokens and turn it on by choosing the text, amount and activating the plug-in.
    Then your users can get the bonus after installing the Fuse app and joining your community.`
  },
  {
    title: 'Fiat on ramp',
    coverImage: Bounty,
    disabled: false,
    modalCoverPhoto: BountyBig,
    key: 'fiat'
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
    subTitle: ' | Top up account',
    coverImage: Moonpay,
    key: 'moonpay',
    text: 'Accept credit/debit cards, 4.5% per transaction',
    website: 'https://www.moonpay.io/'
  },
  {
    title: 'Ramp',
    subTitle: ' | Top up account',
    coverImage: Ramp,
    key: 'ramp',
    text: 'Europe wire transfer (SEPA)',
    website: 'https://instant.ramp.network/'
  },
  {
    title: 'Coindirect',
    subTitle: ' | Top up account',
    coverImage: Coindirect,
    key: 'coindirect',
    text: 'Accept credit/debit cards, 2.99% per transaction',
    website: 'https://www.coindirect.com/'
  },
  {
    title: 'Carbon',
    subTitle: ' | Top up account',
    coverImage: Carbon,
    key: 'carbon',
    text: 'Accept credit/debitc cards, ACH, SEPA',
    website: 'https://www.carbon.money/'
  },
  {
    title: 'Wyre',
    subTitle: ' | Top up account',
    coverImage: Wyre,
    key: 'wyre',
    text: 'Accept credit/debit cards, ACH',
    website: 'https://www.sendwyre.com/'
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
  loadModal,
  addCommunityPlugin,
  community
}) => {
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
      window.analytics.track(`${upperFirst(lowerCase(upperCase(name)))} ${plugin.isRemoved ? 'removed' : 'added'}`)
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

  return (
    community ? <div className='plugins'>
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
        <PluginList pluginList={generalPlugins} pluginTile={'Choose plug-in you want to add'} plugins={plugins} showInfoModal={showInfoModal} addPlugin={addPlugin} togglePlugin={togglePlugin} />
        <PluginList pluginList={onRampPluginItems} pluginTile='Fiat On-ramp' plugins={plugins} showInfoModal={showInfoModal} addPlugin={addPlugin} togglePlugin={togglePlugin} />
      </div>
    </div> : <div />
  )
}

const mapStateToProps = (state) => ({
  community: getCurrentCommunity(state, getCommunityAddress(state))
})

const mapDispatchToProps = {
  loadModal,
  addCommunityPlugin
}

export default connect(mapStateToProps, mapDispatchToProps)(Plugins)
