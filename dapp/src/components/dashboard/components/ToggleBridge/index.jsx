import React from 'react'
import { Formik, Field } from 'formik'
import { object, boolean } from 'yup'
import ReactTooltip from 'react-tooltip'
import FontAwesome from 'react-fontawesome'
import get from 'lodash/get'
import { connect } from 'react-redux'

class ToggleBridgeVersion extends React.Component {
  constructor (props) {
    super(props)

    const { isUseMultiBridge, hasHomeTokenInNewBridge } = props

    this.initialValues = {
      isUseMultiBridge: hasHomeTokenInNewBridge || isUseMultiBridge
    }

    this.validationSchema = object().noUnknown(false).shape({
      isUseMultiBridge: boolean()
    })
  }

  renderForm = ({ values, handleSubmit, submitForm }) => {
    const { isUseMultiBridge } = values
    return (
      <form className='bridge_toggle' onSubmit={handleSubmit}>
        <Field
          name='isUseMultiBridge'
          render={({ field, form: { handleChange } }) => (
            <div className='grid-x align-middle'>
              <label className='toggle'>
                <input
                  {...field}
                  type='checkbox'
                  checked={isUseMultiBridge}
                  onChange={e => {
                    handleChange(e)
                    setTimeout(submitForm, 2)
                  }}
                />
                <div className='toggle-wrapper'>
                  <span className='toggle' />
                </div>
              </label>
              <div className='close_open_community__text'>
                <span>&nbsp;{isUseMultiBridge ? ' V2' : 'V1'}</span>
              </div>
              &nbsp;<FontAwesome style={{ fontSize: '60%' }} data-tip data-for='MultiBridge' name='info-circle' />
              <ReactTooltip className='tooltip__content' id='MultiBridge' place='bottom' effect='solid'>
                <div>Multi bridge tooltip</div>
              </ReactTooltip>
            </div>
          )}
        />

      </form>
    )
  }

  render () {
    const { submitHandler } = this.props

    return (
      <Formik
        initialValues={this.initialValues}
        onSubmit={(values, bag) => {
          submitHandler(values)
        }}
        validationSchema={this.validationSchema}
        render={this.renderForm}
        initialStatus={false}
        validateOnChange
        isInitialValid={false}
      />
    )
  }
}

const mapStateToProps = (state) => ({
  hasHomeTokenInNewBridge: get(state, 'screens.dashboard.hasHomeTokenInNewBridge', false)
})

export default connect(mapStateToProps, null)(ToggleBridgeVersion)
