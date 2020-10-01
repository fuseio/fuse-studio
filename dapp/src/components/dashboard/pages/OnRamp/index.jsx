import React, { Fragment } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addCommunityPlugin } from 'actions/community'
import get from 'lodash/get'
import PluginsForm from './PluginsForm'
import { getCurrentCommunity } from 'selectors/dashboard'

const OnRamp = () => {
  const community = useSelector(state => getCurrentCommunity(state))
  const dispatch = useDispatch()
  const services = get(community, 'plugins.onramp.services', {})

  const addPlugin = (nestedPlugin) => {
    const newServices = { ...services }
    if (nestedPlugin.name === 'moonpay' && nestedPlugin.isActive) {
      newServices.transak = { isActive: false, name: 'transak' }
      newServices.rampInstant = { isActive: false, name: 'rampInstant' }
    }
    if (nestedPlugin.name === 'transak' && nestedPlugin.isActive) {
      newServices.moonpay = { isActive: false, name: 'moonpay' }
      newServices.rampInstant = { isActive: false, name: 'rampInstant' }
    }
    if (nestedPlugin.name === 'rampInstant' && nestedPlugin.isActive) {
      newServices.moonpay = { isActive: false, name: 'moonpay' }
      newServices.transak = { isActive: false, name: 'transak' }
    }
    dispatch(addCommunityPlugin(community.communityAddress, { ...get(community, 'plugins.onramp', {}), services: { ...newServices, [nestedPlugin.name]: nestedPlugin } }))
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
            <br />
            The selected option will appear to users on the wallet app
            <br />
            (after switching to your community)
          </div>
          <br />
          <PluginsForm myPlugins={services} addPlugin={addPlugin} />
        </div>
      </div>
    </Fragment>
  )
}

export default OnRamp
