import React, { Fragment, useEffect, useMemo, useCallback } from 'react'
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

import CommunityTypes from 'constants/communityTypes'
import { existingTokens } from 'constants/existingTokens'
import { loadState } from 'utils/storage'

import { withNetwork } from 'containers/Web3'
import useSwitchNetwork from 'hooks/useSwitchNetwork'
import withTracker from 'containers/withTracker'
import Message from 'components/common/SignMessage'
import Wizard from 'components/wizard/container'
import NameAndEmail from 'components/wizard/pages/NameAndEmail'
import DetailsStep from 'components/wizard/pages/DetailsStep'
import SummaryStep from 'components/wizard/pages/SummaryStep'
import DeployProgressStep from 'components/wizard/pages/DeployProgress'
import Congratulations from 'components/wizard/components/Congratulations'

import contractIcon from 'images/contract.svg'
import BridgeIcon from 'images/Bridge.svg'

const getInitialValues = (templateId, networkType) => {
  const networkState = loadState('state.network') || CONFIG.web3.bridge.network
  const { foreignNetwork } = networkState
  switch (templateId) {
    case '1':
      return {
        plugins: {
          businessList: {
            isActive: true
          },
          joinBonus: {
            isActive: true
          }
        },
        existingToken: existingTokens(networkType || foreignNetwork)[0],
        communitySymbol: existingTokens(networkType || foreignNetwork)[0].symbol
      }
    case '2':
      return {
        plugins: {
          businessList: {
            isActive: true
          },
          joinBonus: {
            isActive: true
          }
        },
        communityType: CommunityTypes[0]
      }
    default:
      return {}
  }
}

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
  push,
  templateId
}) => {
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

  const initialTemplateValues = useCallback(getInitialValues(templateId, networkType), [templateId, networkType])

  const initialValues = useMemo(() => {
    const { plugins, communityType, existingToken, communitySymbol } = initialTemplateValues
    return {
      communityName: '',
      communitySymbol: communitySymbol || '',
      totalSupply: '',
      communityType: communityType || undefined,
      existingToken: existingToken || undefined,
      isOpen: true,
      subscribe: true,
      email: '',
      coverPhoto: {},
      images: {
        chosen: 'defaultOne'
      },
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
      },
      plugins: {
        businessList: {
          isActive: false
        },
        joinBonus: {
          isActive: false
        },
        moonpay: {
          isActive: false
        },
        ramp: {
          isActive: false
        },
        coindirect: {
          isActive: false
        },
        carbon: {
          isActive: false
        },
        wyre: {
          isActive: false
        },
        ...plugins
      }
    }
  }, [initialTemplateValues])

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
      subscribe,
      plugins,
      coverPhoto
    } = values

    const chosenPlugins = Object.keys(plugins)
      .filter((pluginName) => plugins[pluginName].isActive)
      .reduce((newPlugins, name) => ({
        ...newPlugins,
        [name]: {
          isActive: plugins[name].isActive,
          name
        }
      }), {})

    const steps = Object.keys(contracts)
      .filter((contractName) => contracts[contractName].checked)
      .reduce((steps, contractName) => ({
        ...steps,
        [contracts[contractName].key]: contracts[contractName].key === 'bridge'
          ? { args: { foreignTokenAddress: null } }
          : contracts[contractName].key === 'community'
            ? { args: { isClosed: !isOpen, name: communityName, adminAddress, plugins: chosenPlugins } }
            : contracts[contractName].key === 'email'
              ? { args: { email, subscribe } }
              : {}
      }), {})

    const { chosen } = images
    const metadata = chosen !== 'custom' && !existingToken
      ? { isDefault: true, image: images && images[chosen] && images[chosen].blob, coverPhoto: coverPhoto.blob }
      : { image: images && images[chosen] && images[chosen].blob, coverPhoto: coverPhoto.blob }

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
        initialValues={initialValues}
        submitHandler={(values, actions) => {
          setIssuanceTransaction(values)
          actions.setSubmitting(false)
        }}
      >
        <Wizard.Page>
          <NameAndEmail />
        </Wizard.Page>
        <Wizard.Page>
          <DetailsStep networkType={networkType} />
        </Wizard.Page>
        <Wizard.Page isSubmitStep={Boolean(true).toString()}>
          <SummaryStep homeNetwork={homeNetwork} networkType={networkType} />
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

const mapStateToProps = (state, { match }) => ({
  templateId: match.params.templateId,
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
