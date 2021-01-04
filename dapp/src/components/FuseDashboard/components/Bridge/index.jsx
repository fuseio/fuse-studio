import React, { useEffect } from 'react'
import { Form, Formik, Field } from 'formik'
import Balance from 'components/FuseDashboard/components/Balance'
import Message from 'components/common/SignMessage'
import { useDispatch } from 'react-redux'
import { BigNumber } from 'bignumber.js'
import { convertNetworkName } from 'utils/network'
import { loadModal } from 'actions/ui'
import { SHOW_MORE_MODAL } from 'constants/uiConstants'
import FuseLoader from 'images/loader-fuse.gif'
import ReactTooltip from 'react-tooltip'
import withBridge from 'components/common/withBridge'
import FontAwesome from 'react-fontawesome'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { object, number, mixed } from 'yup'
import { transferToForeign, transferToHome, approveToken } from 'utils/bridge'
import { toWei } from 'utils/format'

const validationSchema = object().noUnknown(false).shape({
  amount: number().positive(),
  submitType: mixed().oneOf(['approve', 'transfer']).required().default('transfer'),
  allowance: number()
})

const Bridge = ({
  isRequested,
  handleSendTransaction,
  confirmationNumber,
  confirmationsLimit,
  waitingForRelayEvent,
  waitingForConfirmation
}) => {
  const dispatch = useDispatch()
  const { dashboard, network } = useStore()
  const { web3Context, accountAddress } = network
  const { bridgeStatus } = dashboard
  const homeBridgeAddress = dashboard?.community?.homeBridgeAddress
  const foreignBridgeAddress = dashboard?.community?.foreignBridgeAddress
  const foreignTokenAddress = dashboard?.community?.foreignTokenAddress
  const homeTokenAddress = dashboard?.community?.homeTokenAddress
  const tokenName = dashboard?.homeToken?.name
  const bridgeType = dashboard?.community?.bridgeType
  const symbol = dashboard?.homeToken?.symbol
  const decimals = dashboard?.homeToken?.decimals ?? 18
  const tokenAllowed = dashboard?.allowance[bridgeStatus?.from?.bridge] ?? 0
  const foreignNetwork = dashboard?.foreignNetwork
  const bridgeDirection = dashboard?.community?.bridgeDirection
  const bridge = dashboard?.bridgeStatus?.from?.bridge

  useEffect(() => {
    if (bridgeType === 'multi-amb-erc20-to-erc677' && accountAddress) {
      dashboard.checkAllowance(accountAddress)
    }
  }, [dashboard?.community, network?.accountAddress])

  const openModal = (side) => {
    dispatch(loadModal(SHOW_MORE_MODAL, {
      name: convertNetworkName(bridgeStatus[side].network),
      network: bridgeStatus[side].network !== 'fuse' ? `https://api.infura.io/v1/jsonrpc/${bridgeStatus[side].network}` : CONFIG.web3.fuseProvider,
      homeTokenAddress,
      foreignTokenAddress,
      homeBridgeAddress,
      foreignBridgeAddress,
      tokenName
    }))
  }

  const makeTransaction = ({ submitType, amount }) => {
    if (submitType === 'approve') {
      const tokenAddress = bridge === 'home'
        ? homeTokenAddress
        : foreignTokenAddress
      return approveToken({
        networkType: foreignNetwork,
        bridgeType: bridge,
        tokenAddress,
        amount: toWei(amount),
      },
        web3Context
      )
    } else {
      if (bridge === 'foreign') {
        return transferToHome({
          networkType: foreignNetwork,
          bridgeType,
          bridgeDirection,
          foreignTokenAddress,
          foreignBridgeAddress,
          amount: toWei(amount),
          confirmationsLimit: CONFIG.web3.bridge.confirmations.foreign
        },
          web3Context
        )
      } else {
        return transferToForeign({
          bridgeType,
          networkType: foreignNetwork,
          bridgeDirection,
          homeTokenAddress,
          homeBridgeAddress,
          amount: toWei(amount),
          confirmationsLimit: CONFIG.web3.bridge.confirmations.home
        },
          web3Context
        )
      }
    }
  }

  const renderForm = ({ values, setFieldValue }) => {
    const { amount } = values
    return (
      <Form className='bridge__transfer shrink'>
        <div className='bridge__transfer__form'>
          <Field name='amount'>
            {({ field }) => (
              <input autoComplete='off' type='number' {...field} placeholder='0' />
            )}
          </Field>
          <div className='bridge__transfer__form__currency'>{symbol}</div>
        </div>
        {
          bridgeType === 'multi-amb-erc20-to-erc677'
            ? new BigNumber(tokenAllowed)
              .isGreaterThanOrEqualTo(new BigNumber(amount ?? 0).multipliedBy(10 ** decimals))
              ? (
                <button
                  className='bridge__transfer__form__btn'
                  type='submit'
                  onClick={() => setFieldValue('submitType', 'transfer')}
                >
                  Transfer
                </button>
              )
              : (
                <button
                  className='bridge__transfer__form__btn'
                  type='submit'
                  onClick={() => setFieldValue('submitType', 'approve')}
                >
                  Unlock
                </button>
              )
            : (
              <button
                className='bridge__transfer__form__btn'
                type='submit'
                onClick={() => setFieldValue('submitType', 'transfer')}
              >
                Transfer
              </button>
            )
        }
      </Form>
    )
  }

  const onSubmit = (values, formikBag) => {
    handleSendTransaction(
      values.submitType,
      () => makeTransaction(values),
    )
    formikBag.resetForm()
  }

  return (
    <div className='content__bridge'>
      <div className='content__bridge__wrapper'>
        <div className='content__bridge__title grid-x align-middle'>
          <h3>Bridge</h3>&nbsp;
          <FontAwesome style={{ fontSize: '60%' }} data-tip data-for='bridge' name='info-circle' />
          <ReactTooltip className='tooltip__content' id='bridge' place='bottom' effect='solid'>
            <div>Use the bridge to move tokens to Fuse to add new functionality and faster and cheaper verification times. You can start by selecting an initial sum, sigining the transaction and wait for 2 confirmations. Then you can switch to the Fuse chain to see the coins on the other side. Click here to learn more about the bridge.</div>
          </ReactTooltip>
        </div>
        <div className='content__bridge__container'>
          <Balance
            side='from'
            openModal={() => openModal('from')}
          />
          <Formik
            initialValues={{ amount: '' }}
            enableReinitialize
            onSubmit={onSubmit}
            validateOnMount
            validationSchema={validationSchema}
            validateOnChange
          >
            {(props) => renderForm(props)}
          </Formik>
          <Balance
            side='to'
            openModal={() => openModal('to')}
          />
        </div>
        <Message isOpen={isRequested} isDark />
        {
          waitingForConfirmation
            ? (
              <div className='bridge-deploying'>
                <p className='bridge-deploying-text'>Pending<span>.</span><span>.</span><span>.</span></p>
                <p className='bridge-deploying__loader'><img src={FuseLoader} alt='Fuse loader' /></p>
                {confirmationsLimit && <div className='bridge-deploying-confirmation'>
                  Confirmations
                <div>{confirmationNumber || '0'} / {confirmationsLimit}</div>
                </div>}
              </div>
            ) : null
        }
        {
          waitingForRelayEvent
            ? (
              <div className='bridge-deploying'>
                <p className='bridge-deploying-text'>Waiting for bridge<span>.</span><span>.</span><span>.</span></p>
                <p className='bridge-deploying__loader'><img src={FuseLoader} alt='Fuse loader' /></p>
              </div>
            ) : null
        }
      </div>
    </div>
  )
}

export default withBridge(observer(Bridge))
