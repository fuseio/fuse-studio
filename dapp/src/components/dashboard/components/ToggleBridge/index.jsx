import React from 'react'
import { Formik, Field } from 'formik'
import { object, boolean } from 'yup'
import ReactTooltip from 'react-tooltip'
import FontAwesome from 'react-fontawesome'
import { getIsMultiBridge } from 'selectors/dashboard'
import { toggleMultiBridge } from 'actions/bridge'
import { connect } from 'react-redux'

class ToggleBridge extends React.Component {
  constructor (props) {
    super(props)

    const { isMultiBridge } = props

    this.initialValues = {
      isMultiBridge: isMultiBridge
    }

    this.validationSchema = object().noUnknown(false).shape({
      isMultiBridge: boolean()
    })
  }

  renderForm = ({ values, handleSubmit, submitForm }) => {
    const { isMultiBridge } = values
    return (
      <form className='bridge_toggle' onSubmit={handleSubmit}>
        <Field
          name='isMultiBridge'
          render={({ field, form: { handleChange } }) => (
            <div className='grid-x align-middle'>
              <label className='toggle'>
                <input
                  {...field}
                  type='checkbox'
                  checked={isMultiBridge}
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
                <span>&nbsp;{isMultiBridge ? ' V2' : 'V1'}</span>
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

  onSubmit = (values, bag) => {
    const { toggleMultiBridge } = this.props
    toggleMultiBridge(values.isMultiBridge)
  }

  render () {
    return (
      <Formik
        initialValues={this.initialValues}
        onSubmit={this.onSubmit}
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
  isMultiBridge: getIsMultiBridge(state)
})

export default connect(mapStateToProps, { toggleMultiBridge })(ToggleBridge)
