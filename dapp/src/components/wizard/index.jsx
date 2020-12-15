import React, { Fragment, useEffect, useMemo } from 'react'
import { connect, useSelector } from 'react-redux'
import { BigNumber } from 'bignumber.js'
import { getAccountAddress } from 'selectors/accounts'
import { createTokenWithMetadata, fetchDeployProgress, deployExistingToken, clearTransaction } from 'actions/token'
import { loadModal } from 'actions/ui'
import { FAILURE } from 'actions/constants'
import * as Sentry from '@sentry/browser'
import { push } from 'connected-react-router'
import { toChecksumAddress } from 'web3-utils'

import { getForeignNetwork } from 'selectors/network'

import { withNetwork } from 'containers/Web3'
import withTracker from 'containers/withTracker'
import Message from 'components/common/SignMessage'
import Wizard from 'components/wizard/container'
import NameAndDescription from 'components/wizard/pages/NameAndDescription'
import ChooseCurrencyType from 'components/wizard/pages/ChooseCurrencyType'
import ChooseNetwork from 'components/wizard/pages/ChooseNetwork'
import DetailsStep from 'components/wizard/pages/DetailsStep'
import SummaryStep from 'components/wizard/pages/SummaryStep'
import DeployProgressStep from 'components/wizard/pages/DeployProgress'
import Congratulations from 'components/wizard/components/Congratulations'

import contractIcon from 'images/contract.svg'

const WizardPage = ({
  deployExistingToken,
  createTokenWithMetadata,
  adminAddress,
  networkType,
  transactionStatus,
  error,
  createTokenSignature,
  clearTransaction,
  loadModal,
  communityAddress,
  foreignNetwork,
  push
}) => {
  useEffect(() => {
    if (window && window.analytics) {
      window.analytics.track('Wizard init')
    }
  }, [])

  const email = useSelector(state => state.user.email)

  const initialValues = useMemo(() => ({
    communityName: 'sfasfs',
    communitySymbol: '',
    totalSupply: '',
    communityType: undefined,
    existingToken: undefined,
    description: 'dssdgdsddsfds',
    customToken: '',
    isOpen: true,
    subscribe: true,
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
      funder: {
        checked: true,
        key: 'funder'
      }
    },
    plugins: {
      businessList: {
        isActive: false
      },
      joinBonus: {
        isActive: false
      },
      onramp: {
        isActive: false
      }
    }
  }), [])

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
      customToken,
      plugins,
      coverPhoto,
      description
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
        [contracts[contractName].key]: contracts[contractName].key === 'community'
          ? { args: { isClosed: !isOpen, name: communityName, adminAddress, plugins: chosenPlugins, description } }
          : {}
      }), {})

    const { chosen } = images
    const metadata = chosen !== 'custom' && !existingToken
      ? { isDefault: true, image: images && images[chosen] && images[chosen].blob, coverPhoto: coverPhoto.blob }
      : { image: images && images[chosen] && images[chosen].blob, coverPhoto: coverPhoto.blob }

    Sentry.configureScope((scope) => {
      scope.setUser({ email })
    })

    const sentry = { tags: { issuance: true } }
    if (existingToken && existingToken.label && existingToken.value) {
      const { value: homeTokenAddress } = existingToken
      const newSteps = { ...steps, community: { args: { ...steps.community.args, homeTokenAddress, isCustom: false } } }
      deployExistingToken(metadata, newSteps, { sentry })
    } else if (customToken) {
      const newSteps = { ...steps, community: { args: { ...steps.community.args, homeTokenAddress: toChecksumAddress(customToken), isCustom: true } } }
      deployExistingToken(metadata, newSteps, { sentry })
    } else {
      const tokenData = {
        name: communityName,
        symbol: communitySymbol,
        totalSupply: new BigNumber(totalSupply).multipliedBy(1e18)
      }

      createTokenWithMetadata(tokenData, metadata, communityType.value, steps, { desiredNetworkType: 'fuse', sentry })
    }
  }

  const goToDashboard = () => {
    push(`/view/fuse-community/${communityAddress}/justCreated`)
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
        foreignNetwork={foreignNetwork}
        loadModal={loadModal}
        transactionStatus={transactionStatus}
        createTokenSignature={createTokenSignature}
        initialValues={initialValues}
        submitHandler={(values, actions) => {
          setIssuanceTransaction(values)
          actions.setSubmitting(false)
        }}
      >
        <Wizard.Page>
          <NameAndDescription />
          <ChooseCurrencyType />
        </Wizard.Page>
        {/* <Wizard.Page>
          <ChooseNetwork />
        </Wizard.Page> */}
        {/* <Wizard.Page>
          <ChooseCurrencyType />
        </Wizard.Page> */}
        <Wizard.Page>
          <DetailsStep networkType={networkType} />
        </Wizard.Page>
        <Wizard.Page isSubmitStep={Boolean(true).toString()}>
          <SummaryStep foreignNetwork={foreignNetwork} />
        </Wizard.Page>
        <Wizard.Page>
          <DeployProgressStep />
        </Wizard.Page>
        <Wizard.Page>
          <Congratulations networkType={networkType} goToDashboard={goToDashboard} />
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
  foreignNetwork: getForeignNetwork(state),
  adminAddress: getAccountAddress(state)
})

const mapDispatchToProps = {
  createTokenWithMetadata,
  fetchDeployProgress,
  deployExistingToken,
  clearTransaction,
  loadModal,
  push
}

export default withTracker(withNetwork(connect(mapStateToProps, mapDispatchToProps)(WizardPage)))
