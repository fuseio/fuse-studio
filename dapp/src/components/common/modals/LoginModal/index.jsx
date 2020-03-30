import React from 'react'
import Modal from 'components/common/Modal'
import GoogleLogin from 'react-google-login'

const responseGoogle = (response) => {
  debugger
  console.log(response);
}

export default ({ hideModal }) => {
  return (
    <Modal onClose={hideModal}>
      <div>
        <GoogleLogin
          clientId="35920459637-u2pvmrs28odma6sa2aepclhk91tv9d86.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={'single_host_origin'}
        />
      </div>
      <button onClick={hideModal}>Clouse</button>
    </Modal>)
}
