import React, { Component } from 'react'
import {connect} from 'react-redux'
import Modal from 'components/Modal'
import MediaMobile from 'images/issue-popup-mobile.svg'
import {setUserInformation} from './../../actions/accounts'
import CountriesList from './../../constants/countries'

class UserDatatModal extends Component {
  state = {
    selectedCountry: 'Select Country',
    userName: '',
    userEmail: '',
    gettingEmail: true
  }
  setUserName = e => this.setState({userName: e.target.value})
  setUserEmail = e => this.setState({userEmail: e.target.value})
  setCountry = e => this.setState({selectedCountry: e.target.value})
  setGettingEmail = e => this.setState({gettingEmail: e.target.checked})

  validateEmail = () => {
    const re = /[a-z0-9!#$%&'*+\\/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+\\/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9][a-z0-9-]*[a-z0-9]/
    return re.test(this.state.userEmail)
  }

  setUserInformation () {
    this.props.setUserInformation({
      fullName: this.state.userName,
      email: this.state.userEmail,
      tokenAddress: this.props.receipt.events[0].address,
      country: this.state.selectedCountry,
      receiveMail: this.state.gettingEmail
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
            <label>Full Name</label>
            <input
              id='userName'
              type='text'
              placeholder='Type your name'
              value={this.state.userName}
              onChange={this.setUserName}
            />
          </div>
          <div className='form-control'>
            <label>Email Address</label>
            <input
              className={((this.state.userEmail === '') || this.validateEmail()) ? 'form-control-input' : 'form-control-error'}
              id='userEmail'
              type='email'
              placeholder='Type your email'
              value={this.state.userEmail}
              onChange={this.setUserEmail}
            />
          </div>
          <div className='form-control'>
            <label>Country</label>
            <select
              onChange={this.setCountry}
              value={this.state.selectedCountry}
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
              id='email'
              name='email'
              onChange={this.setGettingEmail}
              checked={this.state.gettingEmail}
            />
            <label className='checkbox-label' htmlFor='email'>
              I agree to receive fuse emails
            </label>
          </div>
          <button
            disabled={
              this.state.selectedCountry === 'Select Country' ||
              this.state.userName === '' ||
              !this.validateEmail() ||
              !this.state.gettingEmail
            }
            className='issued-popup-btn'
            onClick={() => this.setUserInformation()}
          >
            Done
          </button>
        </div>
      </Modal>
    )
  }
}

const mapDispatchToProps = {
  setUserInformation
}

export default connect(null, mapDispatchToProps)(UserDatatModal)
