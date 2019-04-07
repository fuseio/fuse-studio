import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import get from 'lodash/get'
import omit from 'lodash/omit'
import capitalize from 'lodash/capitalize'
import Select from 'react-select'
import { Formik, Field } from 'formik'
import entityShape from 'utils/validation/shapes/entity'
import { businessTypes, options } from 'constants/dropdownOptions'
import FontAwesome from 'react-fontawesome'
import uploadIcon from 'images/upload.svg';

class EntityForm extends Component {

  constructor(props) {
    super(props)

    const { entity } = props

    this.initialValues = {
      name: get(entity, 'name', ''),
      address: get(entity, 'address', ''),
      email: get(entity, 'email', ''),
      phone: get(entity, 'phone', ''),
      websiteUrl: get(entity, 'websiteUrl', ''),
      description: get(entity, 'description', ''),
      type: get(entity, 'type', '', ''),
      account: get(entity, 'account', ''),
      selectedType: options().some(({ value }) => value === get(entity, 'type', '')) ? {
        value: get(entity, 'type', ''),
        label: capitalize(get(entity, 'type', ''))
      } : {}
    }

    this.validationSchema = entityShape
  }

  onSubmit = (values) => {
    const {
      submitEntity
    } = this.props

    const entity = omit(values, 'selectedType');

    submitEntity(entity)
  }

  renderForm = ({ handleSubmit, setFieldValue, setFieldTouched, values }) => {

    return (
      <form className='entity-modal-content' onSubmit={handleSubmit}>
        <h4 className='entity-modal-title'>Business name</h4>
        <Field
          onFocus={() => setFieldTouched('name', true)}
          name='name'
          type='text'
          className='entity-modal-business-name'
          placeholder='Your business name...'
        />
        <div className='row entity-modal-title'>
          <div className='col-2'>
            <p className='entity-modal-content-label'>
              Logo&nbsp; <FontAwesome className='entity-modal-content-label-icon' name='info-circle' />
            </p>
            <div className='logo-rectangle'>
              <label className='entity-modal-content-upload-label' htmlFor='logo' id='logo'>
                <input
                  id='logo'
                  type="file"
                  accept="image/*"
                />
                <p><img alt='upload' src={uploadIcon} /></p>
                <button className="upload-text" type="button">Upload</button>
              </label>
            </div>
          </div>
          <div className='col-5'>
            <p className='entity-modal-content-label'>
              Picture &nbsp;
            <FontAwesome className='entity-modal-content-label-icon' name='info-circle' />
            </p>
            <div className='picture-rectangle'>
              <label className='entity-modal-content-upload-label' htmlFor='picture' id='picture'>
                <input
                  id='picture'
                  type="file"
                  accept="image/*"
                />
                <p><img alt='upload' src={uploadIcon} /></p>
                <button className="upload-text" type="button">Upload</button>
              </label>
            </div>
          </div>
          <div className='col-5'>
            <p className='entity-modal-content-label'>
              Business Type &nbsp;<span className='entity-modal-content-label-second'>Select one</span>
            </p>
            <div className='entity-modal-content-types'>
              {
                businessTypes().map(({ value, label }, key) =>
                  <Field
                    name='type'
                    key={key}
                    render={({ field }) => (
                      <span
                        {...field}
                        className={classNames({
                          'entity-modal-content-type': true,
                          'active-business-type': values.type === value
                        })}
                        onClick={() => setFieldValue('type', value)}
                      >
                        {label}
                      </span>
                    )}
                  />
                )
              }
              <Select
                className={classNames('entity-modal-content-select', {
                  'active-business-select': ((values.type) && (values.type === values.selectedType.value))
                })}
                classNamePrefix='entity-modal-content-select-prefix'
                options={options()}
                placeholder={'Other...'}
                onChange={(val) => {
                  setFieldValue('selectedType', val)
                  setFieldValue('type', val.value)
                }}
              />
            </div>
          </div>
        </div>
        <hr />
        <div className='row'>
          <div className='col-7'>
            <p className='entity-modal-content-label'>
              More info
          </p>
            <div className='row'>
              <div className='col-4'>
                <p className='entity-modal-content-form-control-label'>
                  Business Account
            </p>
              </div>
              <div className='col-8'>
                <Field
                  type='text'
                  name='account'
                  className='entity-modal-content-form-control'
                  placeholder='Type...'
                  onFocus={() => setFieldTouched('account', true)}
                />
              </div>
            </div>
            <div className='row'>
              <div className='col-4'>
                <p className='entity-modal-content-form-control-label'>
                  Business Address
            </p>
              </div>
              <div className='col-8'>
                <Field
                  type='text'
                  name='address'
                  className='entity-modal-content-form-control'
                  placeholder='Type...'
                  onFocus={() => setFieldTouched('address', true)}
                />
              </div>
            </div>
            <div className='row'>
              <div className='col-4'>
                <p className='entity-modal-content-form-control-label'>
                  Business email
            </p>
              </div>
              <div className='col-8'>
                <Field
                  type='email'
                  name='email'
                  className='entity-modal-content-form-control'
                  placeholder='Type...'
                  onFocus={() => setFieldTouched('email', true)}
                />
              </div>
            </div>
            <div className='row'>
              <div className='col-4'>
                <p className='entity-modal-content-form-control-label'>
                  Phone
            </p>
              </div>
              <div className='col-8'>
                <Field
                  type='text'
                  name='phone'
                  className='entity-modal-content-form-control'
                  placeholder='Type...'
                  onFocus={() => setFieldTouched('phone', true)}
                />
              </div>
            </div>
            <div className='row'>
              <div className='col-4'>
                <p className='entity-modal-content-form-control-label'>
                  Website link
            </p>
              </div>
              <div className='col-8'>
                <Field
                  type='text'
                  name='websiteUrl'
                  className='entity-modal-content-form-control'
                  placeholder='Type...'
                  onFocus={() => setFieldTouched('websiteUrl', true)}
                />
              </div>
            </div>
          </div>
          <div className='col-5'>
            <p className='entity-modal-content-label'>
              Description
              <span className='entity-modal-content-label-type'>{values.description.length}/490</span>
            </p>
            <Field
              name="description"
              render={({ field }) => <textarea placeholder='Type...' className='entity-modal-content-form-control' {...field} rows='14' />}
            />
          </div>
        </div>
        <div className='row justify-center'>
          <div className='col-12'>
            <button type='submit' className='btn-add-entity'>Save</button>
          </div>
        </div>
      </form>
    )
  }

  render() {
    return (
      <Formik
        initialValues={this.initialValues}
        validationSchema={this.validationSchema}
        render={this.renderForm}
        onSubmit={this.onSubmit}
      />
    )
  }
}

EntityForm.propTypes = {
  submitEntity: PropTypes.func.isRequired
}

export default EntityForm
