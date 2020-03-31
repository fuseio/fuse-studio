import React from 'react'
import { useDispatch } from 'react-redux'
import Modal from 'components/common/Modal'
import GoogleLogin from 'react-google-login'
import { login } from 'actions/user'

const { clientId } = CONFIG.api.auth.google

export default ({ hideModal }) => {
  const dispatch = useDispatch()

  const handleLogin = ({ tokenId }) => {
    dispatch(login(tokenId))
    hideModal()
  }

  return (
    <Modal onClose={hideModal}>
      <div style={{ padding: 20 }}>
        <GoogleLogin
          clientId={clientId}
          buttonText='Login'
          onSuccess={handleLogin}
          cookiePolicy={'single_host_origin'}
        />
      </div>
      <button onClick={hideModal}>Clouse</button>
    </Modal>)
}
