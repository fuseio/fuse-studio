import React from 'react'
import { useDispatch } from 'react-redux'
import Modal from 'components/common/Modal'
import GoogleLogin from 'react-google-login'
import GoogleIcon from 'images/google.svg'
import { login } from 'actions/user'

const { clientId } = CONFIG.api.auth.google

export default ({ hideModal }) => {
  const dispatch = useDispatch()

  const handleLogin = ({ tokenId }) => {
    dispatch(login(tokenId))
    hideModal()
  }

  const renderButton = ({ onClick, disabled }) => {
    return <div>
      <button className='login-modal__button' onClick={onClick} disabled={disabled}>
        <img src={GoogleIcon} />
        <div>Sign in  with Google</div>
      </button>
    </div>
  }

  return (
    <Modal hasCloseBtn onClose={hideModal}>
      <div className='login-modal'>
        <div className='login-modal__title'>Join Fuse</div>
        <GoogleLogin
          clientId={clientId}
          render={renderButton}
          onSuccess={handleLogin}
          cookiePolicy={'single_host_origin'}
        />
        <div className='login-modal__bottom'>
          Don't have a Google account? <br />
          <a href='https://accounts.google.com/signup/v2' target='_blank'>Click here to create one</a>
        </div>
      </div>
    </Modal>)
}
