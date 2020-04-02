import React from 'react'
import { connect, useDispatch } from 'react-redux'
import { push } from 'connected-react-router'

import { withAccount } from 'containers/Web3'

import { getBalances, getProviderInfo, getCommunitiesKeys } from 'selectors/accounts'
import { getCurrentNetworkType } from 'selectors/network'
import { changeNetwork } from 'actions/network'
import { loadModal } from 'actions/ui'
import { fetchBalances } from 'actions/accounts'

import GoogleLogin from 'react-google-login'
import GoogleIcon from 'images/google.svg'

import { login } from 'actions/user'

const { clientId } = CONFIG.api.auth.google

const LoginDropDown = () => {
  const dispatch = useDispatch()

  const renderButton = ({ onClick, disabled }) => {
    return <div>
      <button className='login-modal__button' onClick={onClick} disabled={disabled}>
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

const mapStateToProps = (state) => ({
  communitiesKeys: getCommunitiesKeys(state),
  providerInfo: getProviderInfo(state),
  tokens: state.entities.tokens,
  metadata: state.entities.metadata,
  communities: state.entities.communities,
  networkType: getCurrentNetworkType(state),
  balances: getBalances(state)
})

const mapDispatchToProps = {
  fetchBalances,
  changeNetwork,
  loadModal,
  push
}

export default withAccount(connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginDropDown))
