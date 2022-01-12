import React from 'react'
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

  const handleError = (error) => {
    console.log('handleError', { ...error })
  }

  const renderButton = ({ onClick, disabled }) => (
    <button className='login-modal__button' onClick={onClick} disabled={disabled}>
      <img src={GoogleIcon} />
      <div>Sign in / Sign up with Google</div>
    </button>
  )

  return (
    <Modal hasCloseBtn onClose={hideModal} className='login-modal'>
      <div className='login-modal__title'>Join Fuse</div>
      <div className='login-modal__text'>
        In order to use the Studio you must have an account, you can create or log-in to your account using you Google account:
      </div>
      <GoogleLogin
        onScriptLoadFailure={(err) => console.log('onScriptLoadFailure', { err })}
        onFailure={handleError}
        clientId={clientId}
        render={renderButton}
        onSuccess={handleLogin}
        cookiePolicy='single_host_origin'
        isSignedIn
      />
    </Modal>
  )
}
