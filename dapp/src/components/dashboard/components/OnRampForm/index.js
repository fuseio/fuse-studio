import React, { Fragment, Component } from 'react'
import classNames from 'classnames'
import { Formik } from 'formik'
import { object, boolean } from 'yup'
import capitalize from 'lodash/capitalize'

const onRampPlugins = {
  ramp: {
    website: 'https://instant.ramp.network/'
  },
  moonpay: {
    website: 'https://www.moonpay.io/'
  },
  carbon: {
    website: 'https://www.carbon.money/'
  },
  wyre: {
    website: 'https://www.sendwyre.com/'
  }
}

class OnRampForm extends Component {
  constructor (props) {
    super(props)

    this.initialValues = {
      isActive: false,
      ...this.props.initialValues
    }

    this.validationSchema = object().noUnknown(false).shape({
      isActive: boolean()
    })
  }

  componentDidUpdate (prevProps) {
    if (prevProps.initialValues !== this.props.initialValues) {
      this.initialValues = {
        isActive: false,
        ...this.props.initialValues
      }
    }
  }

  onSubmit = (values) => {
    const { isActive } = values
    const { addCommunityPlugin, communityAddress, plugin } = this.props
    addCommunityPlugin(communityAddress, { name: plugin.name, isActive })
  }

  renderForm = ({ handleSubmit, isValid, values, handleChange }) => {
    const { isActive } = values
    const { plugin } = this.props
    const name = capitalize(plugin.name)
    const website = onRampPlugins[plugin.name] ? onRampPlugins[plugin.name].website : ''
    return (
      <form onSubmit={handleSubmit} className={classNames('join_bonus__container')}>
        <p className='join_bonus__title'>This plug-in inserts a link on the app menu that opens a page that allows users to top up their account using {name}. {name} allows you to accept credit/debit cards at a 4.5% per transaction. Get more info on the {name} website: <a target='_blank' href={website}>{website}</a></p>
        <div className='join_bonus__actions'>
          <div className='content__toggle'>
            <label className='toggle'>
              <input
                type='checkbox'
                name='isActive'
                checked={isActive}
                defaultValue={isActive}
                onChange={handleChange}
              />
              <div className='toggle-wrapper'>
                <span className='toggle' />
              </div>
            </label>
            <div className='content__toggle__text'>
              <span>{!isActive ? 'Activate' : 'Deactivate'}</span>
            </div>
          </div>
          <button className='button button--normal join_bonus__button'>Save</button>
        </div>
      </form>
    )
  }

  render () {
    return (
      <Fragment>
        <Formik
          initialValues={this.initialValues}
          validationSchema={this.validationSchema}
          render={this.renderForm}
          onSubmit={this.onSubmit}
          enableReinitialize
          validateOnChange
        />
      </Fragment>
    )
  }
}

export default OnRampForm
