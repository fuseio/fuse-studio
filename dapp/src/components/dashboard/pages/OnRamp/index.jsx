import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { addCommunityPlugin } from 'actions/community'
import get from 'lodash/get'
import PluginsForm from './PluginsForm'

const OnRamp = ({
  community,
  addCommunityPlugin
}) => {
  const services = get(community, 'plugins.onramp.services', {})

  const addPlugin = (nestedPlugin) => {
    const newServices = { ...services }
    if (nestedPlugin.name === 'moonpay' && nestedPlugin.isActive) {
      newServices.transak = { isActive: false, name: 'transak' }
    }
    if (nestedPlugin.name === 'transak' && nestedPlugin.isActive) {
      newServices.moonpay = { isActive: false, name: 'moonpay' }
    }
    addCommunityPlugin(community.communityAddress, { ...get(community, 'plugins.onramp', {}), services: { ...newServices, [nestedPlugin.name]: nestedPlugin } })
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
          <PluginsForm myPlugins={services} addPlugin={addPlugin} />
        </div>
      </div>
    </Fragment>
  )
}

const mapDispatchToState = {
  addCommunityPlugin
}

export default connect(null, mapDispatchToState)(OnRamp)
