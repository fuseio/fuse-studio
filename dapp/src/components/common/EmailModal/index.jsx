import React, { useState } from 'react'
import { connect } from 'react-redux'
import Missile from 'images/missile.svg'
import Modal from 'components/common/Modal'
import TextField from '@material-ui/core/TextField'
import { sendEmail } from 'actions/user'

const EmailModal = ({
  hideModal,
  sendEmail
}) => {
  const [email, setEmail] = useState('')
  const [subscribe, setSubscription] = useState(true)

  const sendEmailHandler = () => {
    sendEmail({ email, subscribe })
    hideModal()
  }

  const validateEmail = () => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }

  const handleClose = () => {
    if (window && window.analytics) {
      window.analytics.track('User close email modal')
    }
    hideModal()
  }

  return (
    <Modal hasCloseBtn className='email_modal__wrapper' onClose={() => handleClose()}>
      <div className='email_modal'>
        <div className='email_modal__image'><img src={Missile} /></div>
        <h3 className='email_modal__title'>Getting Started!</h3>
        <div className='email_modal__text'>
          <p>In order to start the wizard you will need an Ethereum account with some ETH for funding (click here for a guide).</p>
          <p>Let us know your email so we could provide with all your community essential information after you complete the launch.</p>
        </div>
        <div className='email__form'>
          <div className='grid-x align-middle'>
            <TextField
              onChange={(e) => setEmail(e.target.value)}
              type='email'
              placeholder='Insert your email'
              classes={{
                root: 'email__form__field cell small-12'
              }}
              InputProps={{
                classes: {
                  underline: 'email__form__field--underline',
                  error: 'email__form__field--error'
                }
              }}
            />
            <button
              style={{ marginLeft: '1em' }}
              className='button button--normal cell small-4'
              disabled={!validateEmail()}
              onClick={sendEmailHandler}
            >
              Start
            </button>
            <div className='email__form__toggle'>
              <label className='toggle'>
                <input
                  type='checkbox'
                  checked={subscribe}
                  onChange={event => setSubscription(event.target.checked)}
                />
                <div className='toggle__handler'>
                  <span className='toggle__handler__indicator' />
                </div>
              </label>
              <div className='email__form__toggle__text'>
                <span>I want to receive updates from Fuse.io</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const mapDispatchToProps = {
  sendEmail
}

export default connect(null, mapDispatchToProps)(EmailModal)
