import React from 'react'
import { useDispatch } from 'react-redux'
import classNames from 'classnames'
import GoogleLogin from 'react-google-login'
import GoogleIcon from 'images/google.svg'

import { login } from 'actions/user'

const { clientId } = CONFIG.api.auth.google

const LoginDropDown = () => {
  const dispatch = useDispatch()

  const renderButton = ({ onClick, disabled }) => {
    return <div>
      <button className={classNames({ 'login-modal__button': true, 'login-modal__disabled': disabled })} onClick={onClick} disabled={disabled}>
        <img src={GoogleIcon} />
        <div>Sign in  with Google</div>
      </button>
    </div>
  }

  const handleLogin = ({ tokenId }) => {
    dispatch(login(tokenId))
  }

  return (
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
  )
}

export default LoginDropDown
