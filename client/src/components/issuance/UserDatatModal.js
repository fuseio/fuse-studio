import React, { Component } from 'react'
import {connect} from 'react-redux'
import Modal from 'components/Modal'
import MediaMobile from 'images/issue-popup-mobile.svg'
import {addUser} from 'actions/user'
import FontAwesome from 'react-fontawesome'
import CountriesList from 'constants/countries'
import Select from 'react-select'

class UserDatatModal extends Component {
  state = {
    country: {},
    firstName: '',
    lastName: '',
    email: '',
    subscribe: true
  }

  setFirstName = e => this.setState({firstName: e.target.value})
  setLastName = e => this.setState({lastName: e.target.value})
  setUserEmail = e => this.setState({email: e.target.value})
  setCountry = country => this.setState({country: country})
  setSubscribe = e => this.setState({subscribe: e.target.checked})

  isInvalidText = (text) => {
    const re = /^\d+$/
    return re.test(text)
  }

  validateEmail = () => {
    const re = /[a-z0-9!#$%&'*+\\/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+\\/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9][a-z0-9-]*[a-z0-9]/
    return re.test(this.state.email)
  }

  addUser () {
    const user = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      country: this.state.country.value,
      subscribe: this.state.subscribe
    }
    this.props.addUser(user, this.props.tokenAddress)
  }

  render () {
    return (
      <Modal className='issued-popup' onClose={this.props.hideModal}>
        <div className='issued-popup-close' onClick={() => this.props.hideModal()}>
          <FontAwesome name='times' />
        </div>
        <div className='issued-popup-media'>
          <h3 className='issued-popup-media-title'>Congratulations, a new crypto was born</h3>
          <img className='issued-popup-media-img' src={MediaMobile} />
        </div>
        <div className='issued-popup-container'>
          <p className='issued-popup-text'>{"Let's continue this wonderful relationship"}</p>
          <div className='form-control'>
            <label>First Name</label>
            <div className='form-control-with-error'>
              <input
                id='firstName'
                type='text'
                placeholder='Type your first name'
                value={this.state.firstName}
                onChange={this.setFirstName}
              />
              {this.isInvalidText(this.state.firstName) && <p className='error-text'>Please type only letters for First Name</p>}
            </div>
          </div>
          <div className='form-control'>
            <label>Last Name</label>
            <div className='form-control-with-error'>
              <input
                id='lastName'
                type='text'
                placeholder='Type your last name'
                value={this.state.lastName}
                onChange={this.setLastName}
              />
              {this.isInvalidText(this.state.lastName) && <p className='error-text'>Please type only letters for Last Name</p>}
            </div>
          </div>
          <div className='form-control'>
            <label>Email Address</label>
            <input
              className={((this.state.email === '') || this.validateEmail()) ? 'form-control-input' : 'form-control-error'}
              id='email'
              type='email'
              placeholder='Type your email'
              value={this.state.email}
              onChange={this.setUserEmail}
            />
          </div>
          <div className='form-control'>
            <label>Country</label>
            <Select
              className='user-modal-select'
              classNamePrefix='user-modal-select-prefix'
              value={this.state.country}
              options={CountriesList}
              placeholder={'Select Country...'}
              onChange={this.setCountry}
            />
          </div>
          <div className='form-control'>
            <input
              className='checkbox-input'
              type='checkbox'
              id='subscribe'
              name='subscribe'
              onChange={this.setSubscribe}
              checked={this.state.subscribe}
            />
            <label className='checkbox-label' htmlFor='subscribe'>
              I agree to receive fuse emails
            </label>
          </div>
          <button
            disabled={
              !this.state.country.value ||
              this.state.firstName.trim() === '' ||
              this.state.firstName.length < 3 ||
              this.state.lastName.trim() === '' ||
              this.state.lastName.length < 3 ||
              !this.isInvalidText(this.state.firstName) ||
              !this.isInvalidText(this.state.lastName) ||
              !this.validateEmail()
            }
            className='issued-popup-btn'
            onClick={() => this.addUser()}
          >
            Done
          </button>
        </div>
      </Modal>
    )
  }
}

const mapDispatchToProps = {
  addUser
}

export default connect(null, mapDispatchToProps)(UserDatatModal)
