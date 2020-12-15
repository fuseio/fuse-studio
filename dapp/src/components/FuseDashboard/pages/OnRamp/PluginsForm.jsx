import React from 'react'
import { Formik } from 'formik'
import pluginsShape from 'utils/validation/shapes/plugins'
import get from 'lodash/get'
import Options from './Option'

const getPluginName = (myPlugins) => {
  const isMoonpay = get(myPlugins, 'moonpay.isActive', false)
  const isTransak = get(myPlugins, 'transak.isActive', false)
  const isRampInstant = get(myPlugins, 'rampInstant.isActive', false)
  return isTransak ? 'transak' : isMoonpay ? 'moonpay' : isRampInstant ? 'rampInstant' : null
}

const PluginsForm = ({ myPlugins, addPlugin }) => {
  const onSubmit = (values, formikBag) => {
    const { plugin } = values
    addPlugin({
      name: plugin,
      isActive: true
    })
  }

  const renderForm = ({ handleSubmit }) => {
    return (
      <form onSubmit={handleSubmit}>
        <Options myPlugins={myPlugins} />
      </form >
    )
  }

  return (
    <Formik
      initialValues={{
        plugin: getPluginName(myPlugins)
      }}
      onSubmit={onSubmit}
      validationSchema={pluginsShape}
      render={renderForm}
      enableReinitialize
    />
  )
}

export default PluginsForm
