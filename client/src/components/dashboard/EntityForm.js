import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Select from 'react-select'

class EntityForm extends Component {
  state = {
    selectedBusinessType: '',
    name: '',
    address: '',
    email: '',
    phone: '',
    websiteUrl: '',
    description: '',
    businessType: '',
    account: ''
  }

  handleSelectChange = (selectedBusinessType) => {
    this.setState({ selectedBusinessType })
    this.setState({ businessType: selectedBusinessType.value })
  }

  componentDidMount () {
    if (this.props.entity) {
      this.setState(this.props.entity)
    }
  }

  handleSubmitEntity = () => this.props.submitEntity(this.state)

  handleNameChange = (event) => this.setState({name: event.target.value})
  handleAddressChange = (event, maxLength) => this.setState({address: event.target.value.slice(0, maxLength)})
  handleEmailChange = (event) => this.setState({email: event.target.value})
  handlePhoneChange = (event) => this.setState({phone: event.target.value})
  handleWebsiteUrlChange = (event) => this.setState({websiteUrl: event.target.value})
  handleAccountChange = (event) => this.setState({account: event.target.value})
  handleDescriptionChange = (event, maxLength) => this.setState({description: event.target.value.slice(0, maxLength)})
  setBusinessTypeChange = (type) => this.setState({businessType: type})

  render () {
    const { selectedBusinessType } = this.state
    const businessTypes = [
      {value: 'food', label: 'Food & Beverages'},
      {value: 'sports', label: 'Sports'},
      {value: 'teсh', label: 'Teсh'},
      {value: 'volunteer', label: 'Volunteer'},
      {value: 'design', label: 'Design & Home'}
    ]
    const options = [
      { value: 'pets', label: 'Pets' },
      { value: 'education', label: 'Education' },
      { value: 'fashion', label: 'Fashion & Accessories' }
    ]
    const modalContentSelectClass = classNames({
      'entity-modal-content-select': true,
      'active-business-select': this.state.businessType === this.state.selectedBusinessType.value
    })
    const MAX_LENGTH_OF_BUSINESS_ADDRESS = 100
    const MAX_LENGTH_OF_BUSINESS_DESCRIPTION = 490
    return [
      <h4 className='entity-modal-title' key={0}>
        Business name
      </h4>,
      <input
        key={1}
        type='text'
        className='entity-modal-business-name'
        placeholder='Your business name...'
        value={this.state.name}
        onChange={this.handleNameChange}
      />,
      <div className='row' key={2}>
        <div className='col-12'>
          <p className='entity-modal-content-label'>
            Business Type <span>Select one</span>
          </p>
          <div className='entity-modal-content-types'>
            {businessTypes.map((type, key) =>
              <span
                key={key}
                className={classNames({
                  'entity-modal-content-type': true,
                  'active-business-type': this.state.businessType === type.value && this.state.selectedBusinessType.value !== type.value
                })}
                onClick={() => this.setBusinessTypeChange(type.value)}
              >
                {type.label}
              </span>
            )}
            <Select
              className={modalContentSelectClass}
              classNamePrefix='entity-modal-content-select-prefix'
              value={selectedBusinessType}
              options={options}
              placeholder={'Other...'}
              onChange={this.handleSelectChange}
            />
          </div>
        </div>
      </div>,
      <hr key={3} />,
      <div key={4} className='row'>
        <div className='col-7'>
          <p className='entity-modal-content-label'>
            Contact info
          </p>
          <div className='row'>
            <div className='col-4'>
              <p className='entity-modal-content-form-control-label'>
                Business Account
              </p>
            </div>
            <div className='col-8'>
              <input
                className='entity-modal-content-form-control'
                placeholder='Type...'
                value={this.state.account}
                onChange={(e) => this.handleAccountChange(e)}
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
              <input
                className='entity-modal-content-form-control'
                placeholder='Type...'
                maxLength={MAX_LENGTH_OF_BUSINESS_ADDRESS}
                value={this.state.address}
                onChange={(e) => this.handleAddressChange(e, MAX_LENGTH_OF_BUSINESS_ADDRESS)}
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
              <input
                className='entity-modal-content-form-control'
                placeholder='Type...'
                value={this.state.email}
                onChange={this.handleEmailChange}
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
              <input
                className='entity-modal-content-form-control'
                placeholder='Type...'
                value={this.state.phone}
                onChange={this.handlePhoneChange}
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
              <input
                className='entity-modal-content-form-control'
                placeholder='Type...'
                value={this.state.websiteUrl}
                onChange={this.handleWebsiteUrlChange}
              />
            </div>
          </div>
        </div>
        <div className='col-5'>
          <p className='entity-modal-content-label'>
            Description
            <span className='entity-modal-content-label-type'>{this.state.description.length}/490</span>
          </p>
          <textarea
            className='entity-modal-content-form-control'
            rows='14'
            maxLength={MAX_LENGTH_OF_BUSINESS_DESCRIPTION}
            value={this.state.description}
            onChange={(e) => this.handleDescriptionChange(e, MAX_LENGTH_OF_BUSINESS_DESCRIPTION)}
          />
        </div>
      </div>,
      <div key={5} className='row justify-center'>
        <div className='col-12'>
          <button
            className='btn-add-entity'
            onClick={this.handleSubmitEntity}
            disabled={this.state.name === ''}
          >
            Save
          </button>
        </div>
      </div>
    ]
  }
}

EntityForm.propTypes = {
  submitEntity: PropTypes.func.isRequired
}

export default EntityForm
