import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { addCommunityPlugin } from 'actions/community'
import pluginsIcons from 'constants/pluginsIcons'
import upperCase from 'lodash/upperCase'
import lowerCase from 'lodash/lowerCase'
import upperFirst from 'lodash/upperFirst'
import get from 'lodash/get'

const onRampServices = [
  'moonpay',
  'ramp',
  'carbon',
  'wyre'
]

const PluginItem = ({ pluginName, isActive, addPlugin }) => {
  return (
    <div className='grid-x align-middle cell small-24 medium-12 plugins_step__item'>
      <img src={pluginsIcons[pluginName]} style={{ width: '15px', height: '15px', marginRight: '10px' }} />
      <div className='plugins_step__title'>{upperFirst(lowerCase(upperCase(pluginName)))}</div>
      <label className='toggle'>
        <input
          type='checkbox'
          checked={isActive}
          onChange={
            (value) => {
              addPlugin({
                name: pluginName,
                isActive: !isActive
              })
            }
          }
        />
        <div className='toggle-wrapper'>
          <span className='toggle' />
        </div>
      </label>
    </div>
  )
}

const Plugins = ({
  allPlugins,
  myPlugins,
  addPlugin
}) => {
  return (
    <div className='grid-x grid-margin-x grid-margin-y plugins_step'>
      {allPlugins.map((pluginName, index) => <PluginItem key={index} pluginName={pluginName} isActive={get(myPlugins, `${pluginName}.isActive`, false)} addPlugin={addPlugin} />)}
    </div>
  )
}

const OnRamp = ({
  community,
  addCommunityPlugin
}) => {
  const services = get(community, 'plugins.onramp.services', {})

  const addPlugin = (nestedPlugin) => {
    addCommunityPlugin(community.communityAddress, { ...get(community, 'plugins.onramp', {}), services: { ...services, [nestedPlugin.name]: nestedPlugin } })
  }

  return (
    <Fragment>
      <div className='onramp__header'>
        <h2 className='onramp__header__title'>Fiat on ramp</h2>
      </div>
      <div className='onramp__wrapper'>
        <div className='onramp__container'>
          <div className='title'>
          Please select the integration you wish to add to your app.
          The selected option will appear to users on the wallet app
          (after switching to your community)
          </div>
          <br />
          <Plugins allPlugins={onRampServices} myPlugins={services} addPlugin={addPlugin} />
        </div>
      </div>
    </Fragment>
  )
}

const mapDispatchToState = {
  addCommunityPlugin
}

export default connect(null, mapDispatchToState)(OnRamp)
