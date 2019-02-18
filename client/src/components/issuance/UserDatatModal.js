import React, { Component } from 'react'
import {connect} from 'react-redux'
import Modal from 'components/Modal'
import MediaMobile from 'images/issue-popup-mobile.svg'
import {addUserInformation} from 'actions/accounts'
import {login} from 'actions/auth'
import CountriesList from 'constants/countries'

class UserDatatModal extends Component {
  state = {
    country: 'Select Country',
    firstName: '',
    lastName: '',
    email: '',
    subscribe: true
  }

  componentDidMount () {
    this.props.login()
  }

  setFirstName = e => this.setState({firstName: e.target.value})
  setLastName = e => this.setState({lastName: e.target.value})
  setUserEmail = e => this.setState({email: e.target.value})
  setCountry = e => this.setState({country: e.target.value})
  setSubscribe = e => this.setState({subscribe: e.target.checked})

  validateEmail = () => {
    const re = /[a-z0-9!#$%&'*+\\/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+\\/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9][a-z0-9-]*[a-z0-9]/
    return re.test(this.state.email)
  }

  addUserInformation () {
    this.props.addUserInformation({
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      country: this.state.country,
      subscribe: this.state.subscribe,
      tokenAddress: this.props.receipt.events[0].address
    })
    this.props.hideModal()
    this.props.setQuitIssuance()
  }

  render () {
    return (
      <Modal className='issued-popup' onClose={this.props.hideModal}>
        <div className='issued-popup-media'>
          <h3 className='issued-popup-media-title'>Congratulations, a new crypto was born</h3>
          <img className='issued-popup-media-img' src={MediaMobile} />
        </div>
        <div className='issued-popup-container'>
          <p className='issued-popup-text'>{"Let's continue this wonderful relationship"}</p>
          <div className='form-control'>
            <label>First Name</label>
            <input
              id='firstName'
              type='text'
              placeholder='Type your first name'
              value={this.state.firstName}
              onChange={this.setFirstName}
            />
          </div>
          <div className='form-control'>
            <label>Last Name</label>
            <input
              id='lastName'
              type='text'
              placeholder='Type your last name'
              value={this.state.lastName}
              onChange={this.setLastName}
            />
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
            <select
              onChange={this.setCountry}
              value={this.state.country}
            >
              <option value='Select Country' disabled>Select Country</option>
              {CountriesList.map((country, key) =>
                <option key={key}>{country}</option>
              )}
            </select>
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
              this.state.country === 'Select Country' ||
              this.state.firstName === '' ||
              this.state.lastName === '' ||
              !this.validateEmail() ||
              !this.state.subscribe
            }
            className='issued-popup-btn'
            onClick={() => this.addUserInformation()}
          >
            Done
          </button>
        </div>
      </Modal>
    )
  }
}

const mapDispatchToProps = {
  addUserInformation,
  login
}

export default connect(null, mapDispatchToProps)(UserDatatModal)
