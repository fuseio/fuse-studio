import React, { Fragment } from 'react'
import { useDispatch } from 'react-redux'
import Modal from 'components/common/Modal'
import GoogleLogin from 'react-google-login'
import GoogleIcon from 'images/google.svg'
import { login } from 'actions/user'

const { clientId } = CONFIG.api.auth.google

export default ({ hideModal, handleConnect }) => {
  const dispatch = useDispatch()
  const handleLogin = ({ tokenId }) => {
    dispatch(login(tokenId))
    hideModal()
    handleConnect()
  }

  const renderButton = ({ onClick, disabled }) => (
    <Fragment>
      <button className='login-modal__button' onClick={onClick} disabled={disabled}>
        <img src={GoogleIcon} />
        <div>Sign in  with Google</div>
      </button>
    </Fragment>
  )

  return (
    <Modal hasCloseBtn onClose={hideModal} className='login-modal'>
      <div className='login-modal__title'>Join Fuse</div>
      <GoogleLogin
        clientId={clientId}
        render={renderButton}
        onSuccess={handleLogin}
        cookiePolicy={'single_host_origin'}
      />
      <div className='login-modal__bottom'>
        Don't have an account? <br />
        <a href='https://accounts.google.com/signup/v2' target='_blank'>Click here to create one</a>
      </div>
    </Modal>
  )
}
