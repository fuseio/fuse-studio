import React, { useState, useEffect } from 'react'
import { Field, connect as formikConnect, getIn } from 'formik'
import { connect } from 'react-redux'
import classNames from 'classnames'
import ethereumMainnet from 'images/ethereum_mainnet.svg'
import ethereumRopsten from 'images/ethereum_ropsten.svg'
import fuseToken from 'images/fuse_token.svg'
import { getAccount, getProviderInfo } from 'selectors/accounts'
import { formatWei } from 'utils/format'
import { getForeignNetwork, getCurrentNetworkType } from 'selectors/network'
import { loadModal } from 'actions/ui'
import { changeNetwork } from 'actions/network'
import { SWITCH_NETWORK } from 'constants/uiConstants'

const NetworkOption = ({ network, account, logo, name, value, Content }) => {
  const hasBalance = parseFloat(account && account.foreign ? formatWei((account.foreign), 2) : '0') > 0.01
  const [hasEth, setHasEth] = useState(true)
  useEffect(() => {
    if (value === network) {
      setHasEth(hasBalance)
    }
  }, [account, network])
  return (
    <Field
      name='network'
      render={({ field, form: { setFieldValue } }) => (
        <label htmlFor={value} className={classNames('option option--fullWidth grid-x align-middle', { 'option--selected': field.value === value }, { 'option--error': value === network && !hasEth })}>
          <input
            style={{ display: 'none' }}
            id={value}
            value={value}
            type='radio'
            checked={field.value === value}
            onChange={(e) => {
              setFieldValue('network', e.target.value)
            }}
          />
          <div className='option__logo grid-x align-center cell small-4'>
            <img src={logo} />
          </div>
          <div className='option__content cell large-auto grid-y'>
            <div className='title'>{name}</div>
            <Content />
            <span className='error' style={{ display: value === network && !hasEth ? 'block' : 'none' }}>
              You need at least 0.1 ETH (you have <span>{account && account.foreign ? formatWei((account.foreign), 2) : 0}&nbsp;</span> ETH).
            </span>
          </div>
        </label>
      )}
    />
  )
}

const ChooseNetwork = ({ providerInfo, loadModal, changeNetwork, networkType, formik, foreignNetwork, account }) => {
  const network = getIn(formik.values, 'network')

  useEffect(() => {
    const hasBalance = parseFloat(account && account.foreign ? formatWei((account.foreign), 2) : '0') > 0.01
    formik.setFieldValue('hasBalance', hasBalance)
  }, [account])

  const loadSwitchModal = (desired) => {
    loadModal(SWITCH_NETWORK, { desiredNetworkType: [desired], networkType, goBack: false })
  }

  const switchNetwork = () => {
    if (providerInfo.type === 'injected') {
      loadSwitchModal(network)
    } else if (providerInfo.type === 'web') {
      changeNetwork(network)
    }
  }

  useEffect(() => {
    if (!network) return
    if (network !== networkType) {
      switchNetwork()
    }
  }, [network])

  return (
    <div className='options_network__wrapper grid-y align-spaced'>
      <div className='options_network grid-x'>
        <NetworkOption
          network={network}
          account={account}
          logo={ethereumMainnet}
          name='Ethereum Mainnet'
          value='main'
          Content={() => (
            <div className='text'>
              <div>
                This will require you to pay network fees in ETH
                <a className='link' href='https://metamask.zendesk.com/hc/en-us/articles/360015489531-Getting-Started-With-MetaMask-Part-1-' target='_blank' rel='noopener noreferrer'> Read more</a>
              </div>
              After deployment on Ethereum you will receive <span className='bold'>100 Fuse</span> <img src={fuseToken} />
              &nbsp;that will cover your transactions on Fuse for your community bootstrapping period
            </div>
          )}
        />
        <NetworkOption
          network={network}
          account={account}
          logo={ethereumRopsten}
          name='Ethereum Ropsten'
          value='ropsten'
          Content={() => (
            <div className='text'>
              <div>
                This is an Ethereum testnet so you can do your tests for free
                <a className='link' href='https://docs.fuse.io/the-fuse-studio/getting-started/using-the-studio-for-free-on-ropsten' target='_blank' rel='noopener noreferrer'> Read more</a>
              </div>
              After deployment on Ropsten you will receive <span className='bold'>10 Fuse</span> <img src={fuseToken} />
              &nbsp;that will cover your transactions on Fuse for your testing period
            </div>
          )}
        />
      </div>
    </div>
  )
}

const mapState = (state) => ({
  account: getAccount(state),
  foreignNetwork: getForeignNetwork(state),
  networkType: getCurrentNetworkType(state),
  providerInfo: getProviderInfo(state)
})

export default connect(mapState, { loadModal, changeNetwork })(formikConnect(ChooseNetwork))
