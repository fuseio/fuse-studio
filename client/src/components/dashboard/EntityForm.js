import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Select from 'react-select'

class EntityForm extends Component {
  state = {
    selectedBusinessType: '',
    businessName: '',
    businessAddress: '',
    businessEmail: '',
    businessPhone: '',
    businessLink: '',
    businessDescription: '',
    activeBusinessType: '',
    businessAccount: ''
  }

  constructor (props) {
    super(props)
    this.handleSelectChange = this.handleSelectChange.bind(this)
  }

  handleSelectChange = selectedBusinessType => {
    this.setState({ selectedBusinessType })
    this.setState({ activeBusinessType: selectedBusinessType.value })
  }

  handleAddEntity = () => this.props.addEntity({
    name: this.state.businessName,
    address: this.state.businessAddress,
    email: this.state.businessEmail,
    phone: this.state.businessPhone,
    link: this.state.businessLink,
    description: this.state.businessDescription,
    businessType: this.state.activeBusinessType,
    businessAccount: this.state.businessAccount
  })

  handleBusinessNameChange = (event) => this.setState({businessName: event.target.value})
  handleBusinessAddressChange = (event, maxLength) => this.setState({businessAddress: event.target.value.slice(0, maxLength)})
  handleBusinessEmailChange = (event) => this.setState({businessEmail: event.target.value})
  handleBusinessPhoneChange = (event) => this.setState({businessPhone: event.target.value})
  handleBusinessLinkChange = (event) => this.setState({businessLink: event.target.value})
  handleBusinessAccountChange = (event) => this.setState({businessAccount: event.target.value})
  handleBusinessDescriptionChange = (event, maxLength) => this.setState({businessDescription: event.target.value.slice(0, maxLength)})

  setActiveBusinessTypeChange = (type) => this.setState({activeBusinessType: type})

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
      'active-business-select': this.state.activeBusinessType === this.state.selectedBusinessType.value
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
        value={this.state.businessName}
        onChange={this.handleBusinessNameChange}
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
                  'active-business-type': this.state.activeBusinessType === type.value && this.state.selectedBusinessType.value !== type.value
                })}
                onClick={() => this.setActiveBusinessTypeChange(type.value)}
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
                value={this.state.businessAccount === '' ? this.props.accountAddress : this.state.businessAccount}
                onChange={(e) => this.handleBusinessAccountChange(e)}
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
                value={this.state.businessAddress}
                onChange={(e) => this.handleBusinessAddressChange(e, MAX_LENGTH_OF_BUSINESS_ADDRESS)}
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
                value={this.state.businessEmail}
                onChange={this.handleBusinessEmailChange}
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
                value={this.state.businessPhone}
                onChange={this.handleBusinessPhoneChange}
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
                value={this.state.businessLink}
                onChange={this.handleBusinessLinkChange}
              />
            </div>
          </div>
        </div>
        <div className='col-5'>
          <p className='entity-modal-content-label'>
            Description
            <span className='entity-modal-content-label-type'>{this.state.businessDescription.length}/490</span>
          </p>
          <textarea
            className='entity-modal-content-form-control'
            rows='14'
            maxLength={MAX_LENGTH_OF_BUSINESS_DESCRIPTION}
            value={this.state.businessDescription}
            onChange={(e) => this.handleBusinessDescriptionChange(e, MAX_LENGTH_OF_BUSINESS_DESCRIPTION)}
          />
        </div>
      </div>,
      <div key={5} className='row justify-center'>
        <div className='col-12'>
          <button
            className='btn-add-entity'
            onClick={() => this.handleAddEntity()}
            disabled={this.state.businessName === ''}
          >
            Save
          </button>
        </div>
      </div>
    ]
  }
}

EntityForm.propTypes = {
  addEntity: PropTypes.func.isRequired,
  accountAddress: PropTypes.string
}

export default EntityForm
