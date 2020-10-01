import React, { Component } from 'react'
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

class PluginsForm extends Component {
  constructor (props) {
    super(props)

    const { myPlugins } = props

    this.initialValues = {
      plugin: getPluginName(myPlugins)
    }

    this.validationSchema = pluginsShape
  }

  onSubmit = (values, formikBag) => {
    const { addPlugin } = this.props
    const { plugin } = values
    addPlugin({
      name: plugin,
      isActive: true
    })
    formikBag.resetForm({ plugin })
  }

  renderForm = ({ handleSubmit }) => {

    return (
      <form onSubmit={handleSubmit}>
        <Options myPlugins={this.props.myPlugins} />
      </form >
    )
  }

  render () {
    return (
      <Formik
        initialValues={this.initialValues}
        onSubmit={this.onSubmit}
        validationSchema={pluginsShape}
        render={this.renderForm}
        enableReinitialize
      />
    )
  }
}

export default PluginsForm
