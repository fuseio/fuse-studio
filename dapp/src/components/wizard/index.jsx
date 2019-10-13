import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { BigNumber } from 'bignumber.js'
import { getAccountAddress } from 'selectors/accounts'
import { createTokenWithMetadata, fetchDeployProgress, deployExistingToken, clearTransaction } from 'actions/token'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import { loadModal } from 'actions/ui'
import { FAILURE } from 'actions/constants'
import WizardShape from 'utils/validation/shapes/wizard'

import Wizard from './container'
import Message from 'components/common/SignMessage'
import NameAndCurrencyStep from './pages/NameAndCurrency'
import DetailsStep from './pages/DetailsStep'
import ContractsStep from './pages/Contracts'
import SummaryStep from './pages/SummaryStep'
import DeployProgressStep from './pages/DeployProgress'
import Congratulations from 'components/issuance/Congratulations'

import contractIcon from 'images/contract.svg'
import BridgeIcon from 'images/Bridge.svg'

const WizardPage = ({
  deployExistingToken,
  createTokenWithMetadata,
  adminAddress,
  homeNetwork,
  networkType,
  transactionStatus,
  error,
  createTokenSignature,
  clearTransaction,
  steps,
  loadModal,
  history,
  communityAddress,
  ...props
}) => {
  useEffect(() => {
    if (networkType === homeNetwork) {
      loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: ['ropsten', 'mainnet'] })
    }
  }, [homeNetwork, networkType])

  const setIssuanceTransaction = (values) => {
    const {
      communityName,
      communitySymbol,
      totalSupply,
      isOpen,
      communityType,
      contracts,
      communityLogo,
      images,
      existingToken,
      email,
      subscribe
    } = values

    const steps = Object.keys(contracts)
      .filter((contractName) => contracts[contractName].checked)
      .reduce((steps, contractName) => ({
        ...steps,
        [contracts[contractName].key]: contracts[contractName].key === 'bridge'
          ? { args: { foreignTokenAddress: null } }
          : contracts[contractName].key === 'community'
            ? { args: { isClosed: !isOpen, name: communityName, adminAddress } }
            : contracts[contractName].key === 'email'
              ? { args: { email, subscribe } }
              : {}
      }), {})

    if (existingToken) {
      const { value: foreignTokenAddress } = existingToken
      const newSteps = { ...steps, bridge: { args: { foreignTokenAddress } } }
      deployExistingToken(newSteps)
    } else {
      const tokenData = {
        name: communityName,
        symbol: communitySymbol,
        totalSupply: new BigNumber(totalSupply).multipliedBy(1e18)
      }
      const metadata = communityLogo ? { communityLogo: communityLogo.name } : { image: images.blob }
      createTokenWithMetadata(tokenData, metadata, communityType.value, steps)
    }
  }

  const goToDashboard = () => {
    history.push(`/view/community/${communityAddress}/justCreated`)
  }

  const transactionDenied = () => {
    return transactionStatus && transactionStatus === 'FAILURE' && error && typeof error.includes === 'function' && error.includes('denied')
  }

  return (
    <Fragment>
      <Wizard
        networkType={networkType}
        loadModal={loadModal}
        transactionStatus={transactionStatus}
        createTokenSignature={createTokenSignature}
        validationSchema={WizardShape}
        initialValues={{
          communityName: '',
          communitySymbol: '',
          totalSupply: '',
          communityType: undefined,
          existingToken: undefined,
          communityLogo: undefined,
          isOpen: true,
          images: undefined,
          email: '',
          subscribe: true,
          contracts: {
            community: {
              label: 'Members list',
              checked: true,
              key: 'community',
              icon: contractIcon
            },
            bridge: {
              label: 'Bridge to fuse',
              checked: true,
              key: 'bridge',
              icon: BridgeIcon
            },
            transferOwnership: {
              checked: true,
              key: 'transferOwnership'
            },
            funder: {
              checked: true,
              key: 'funder'
            },
            email: {
              checked: true,
              key: 'email'
            }
          }
        }}
        submitHandler={(values, actions) => {
          setIssuanceTransaction(values)
          actions.setSubmitting(false)
        }}
      >
        <Wizard.Page>
          <NameAndCurrencyStep networkType={networkType} />
        </Wizard.Page>
        <Wizard.Page>
          <DetailsStep networkType={networkType} />
        </Wizard.Page>
        <Wizard.Page>
          <ContractsStep />
        </Wizard.Page>
        <Wizard.Page isSubmitStep={Boolean(true).toString()}>
          <SummaryStep networkType={networkType} />
        </Wizard.Page>
        <Wizard.Page>
          <DeployProgressStep />
        </Wizard.Page>
        <Wizard.Page>
          <Congratulations goToDashboard={goToDashboard} />
        </Wizard.Page>
      </Wizard>

      <Message
        radiusAll
        issue
        isOpen={createTokenSignature}
        message='Pending'
        isDark
      />

      <Message
        issue
        message={'Oh no'}
        subTitle={`You reject the action, That’s ok, try next time!`}
        isOpen={transactionDenied()}
        clickHandler={() => clearTransaction()}
      />

      <Message
        radiusAll
        issue
        isOpen={transactionStatus === FAILURE}
        message='Something went wrong'
        clickHandler={() => clearTransaction()}
        subTitle='Try again later'
      />
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  ...state.screens.issuance,
  foreignNetwork: state.network.foreignNetwork,
  homeNetwork: state.network.homeNetwork,
  adminAddress: getAccountAddress(state)
})

const mapDispatchToProps = {
  createTokenWithMetadata,
  fetchDeployProgress,
  deployExistingToken,
  clearTransaction,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToProps)(WizardPage)
