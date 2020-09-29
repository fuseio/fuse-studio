import React, { Component, Fragment } from 'react'
import { Formik, Field } from 'formik'
import pluginsShape from 'utils/validation/shapes/plugins'
import get from 'lodash/get'
import pluginsIcons from 'constants/pluginsIcons'
import MyTable from 'components/dashboard/components/Table'

const getPluginName = (myPlugins) => {
  const isMoonpay = get(myPlugins, 'moonpay.isActive', false)
  const isTransak = get(myPlugins, 'transak.isActive', false)
  return isTransak ? 'transak' : isMoonpay ? 'moonpay' : null
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
  }

  renderForm = ({ values, handleSubmit, submitForm }) => {
    const { plugin } = values
    const isMoonpay = plugin === 'moonpay'
    const isTransak = plugin === 'transak'

    return (
      <form onSubmit={handleSubmit} className='containerOuter'>
        <div className='containerInner'>
          <Field
            name='plugin'
            render={({ field, form: { setFieldValue } }) => (
              <Fragment>
                <input {...field} type='radio' value='moonpay' checked={isMoonpay} className='hidden' id='moonpay' onChange={(e) => {
                  setFieldValue('plugin', e.target.value)
                  setTimeout(submitForm, 3)
                }} />
                <label className='entry' htmlFor='moonpay'>
                  <div className='circle' />
                  <div className='entry-label'>
                    <img src={pluginsIcons['moonpay']} style={{ width: '15px', height: '15px', marginRight: '10px' }} />
                  Moonpay
                  </div>
                </label>
              </Fragment>
            )}
          />
          <Field
            name='plugin'
            render={({ field, form: { setFieldValue } }) => (
              <Fragment>
                <input {...field} type='radio' checked={isTransak} value='transak' className='hidden' id='transak' onChange={(e) => {
                  setFieldValue('plugin', e.target.value)
                  setTimeout(submitForm, 3)
                }} />
                <label className='entry' htmlFor='transak'>
                  <div className='circle' />
                  <div className='entry-label'>
                    <img src={pluginsIcons['transak']} style={{ width: '15px', height: '15px', marginRight: '10px' }} />
                    Transak
                  </div>
                </label>
              </Fragment>
            )}
          />
          <div className='highlight' />
          <div className='overlay' />
        </div>
      </form >
    )
  }

  render () {
    return (
      <Formik
        initialValues={this.initialValues}
        onSubmit={this.onSubmit}
        validationSchema={this.validationSchema}
        render={this.renderForm}
        validateOnChange
      />
    )
  }
}

export default PluginsForm
