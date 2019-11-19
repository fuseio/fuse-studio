import React, { Fragment, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { BigNumber } from 'bignumber.js'
import { getAccountAddress } from 'selectors/accounts'
import { createTokenWithMetadata, fetchDeployProgress, deployExistingToken, clearTransaction } from 'actions/token'
import { signUpUser } from 'actions/user'
import { loadModal } from 'actions/ui'
import { FAILURE } from 'actions/constants'
import WizardShape from 'utils/validation/shapes/wizard'
import * as Sentry from '@sentry/browser'
import { push } from 'connected-react-router'

import { withNetwork } from 'containers/Web3'
import withTracker from 'containers/withTracker'
import Message from 'components/common/SignMessage'
import Wizard from 'components/wizard/container'
import NameAndCurrencyStep from 'components/wizard/pages/NameAndCurrency'
import DetailsStep from 'components/wizard/pages/DetailsStep'
import ContractsStep from 'components/wizard/pages/Contracts'
import SummaryStep from 'components/wizard/pages/SummaryStep'
import DeployProgressStep from 'components/wizard/pages/DeployProgress'
import Congratulations from 'components/wizard/components/Congratulations'

import contractIcon from 'images/contract.svg'
import BridgeIcon from 'images/Bridge.svg'
import useSwitchNetwork from 'hooks/useSwitchNetwork'

const WizardPage = ({
  deployExistingToken,
  createTokenWithMetadata,
  signUpUser,
  adminAddress,
  networkType,
  transactionStatus,
  error,
  createTokenSignature,
  clearTransaction,
  loadModal,
  communityAddress,
  homeNetwork,
  push
}) => {
  useEffect(() => {
    if (window && window.analytics) {
      window.analytics.track('Wizard init')
    }
  }, [])

  useEffect(() => {
    if (adminAddress) {
      window.analytics.identify(adminAddress, {
        subscriptionStatus: 'active'
      })
    } else {
      window.analytics.identify({
        subscriptionStatus: 'inactive'
      })
    }
  }, [adminAddress])

  const desiredNetworkType = useMemo(() => {
    if (!networkType) {
      return ['mainnet', 'ropsten']
    } else if (networkType === homeNetwork) {
      return ['ropsten', 'mainnet']
    } else {
      const secondDesired = networkType === 'ropsten' ? 'mainnet' : 'ropsten'
      return [networkType, secondDesired]
    }
  }, [])

  useSwitchNetwork(desiredNetworkType, { featureName: 'Wizard' })

  const setIssuanceTransaction = (values) => {
    const {
      communityName,
      communitySymbol,
      totalSupply,
      isOpen,
      communityType,
      contracts,
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

    const { chosen } = images
    const metadata = chosen !== 'custom' && !existingToken
      ? { isDefault: true, image: images && images[chosen] && images[chosen].blob }
      : { image: images && images[chosen] && images[chosen].blob }

    if (adminAddress) {
      window.analytics.identify(adminAddress, {
        email
      })
      Sentry.configureScope((scope) => {
        scope.setUser({ email })
      })
    }

    if (existingToken && existingToken.label && existingToken.value) {
      const { value: foreignTokenAddress } = existingToken
      const newSteps = { ...steps, bridge: { args: { foreignTokenAddress } } }
      deployExistingToken(metadata, newSteps)
    } else {
      const tokenData = {
        name: communityName,
        symbol: communitySymbol,
        totalSupply: new BigNumber(totalSupply).multipliedBy(1e18)
      }
      createTokenWithMetadata(tokenData, metadata, communityType.value, steps)
    }

    signUpUser(email, subscribe)
  }

  const goToDashboard = () => {
    push(`/view/community/${communityAddress}/justCreated`)
  }

  const transactionDenied = () => {
    return transactionStatus && transactionStatus === 'FAILURE' && error && typeof error.includes === 'function' && error.includes('denied')
  }

  return (
    <Fragment>
      <Wizard
        push={push}
        adminAddress={adminAddress}
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
          isOpen: true,
          images: {
            chosen: ''
          },
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
          <DetailsStep />
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
  signUpUser,
  clearTransaction,
  loadModal,
  push
}

export default withTracker(withNetwork(connect(mapStateToProps, mapDispatchToProps)(WizardPage)))
