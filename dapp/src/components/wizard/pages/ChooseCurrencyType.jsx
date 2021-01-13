import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Field, useFormikContext, getIn } from 'formik'
import classNames from 'classnames'
import useInterval from 'hooks/useInterval'
import createNewToken from 'images/create_new_token.svg'
import existingToken from 'images/existing_token.svg'
import { nameToSymbol, formatWei } from 'utils/format'
import { fund, fetchFundingStatus } from 'actions/user'
import { getAccountAddress, getAccount } from 'selectors/accounts'
import FontAwesome from 'react-fontawesome'
import { getBlockExplorerUrl } from 'utils/network'

const CurrencyOption = ({ logo, name, value }) => {
  return (
    <Field name='currency'>
      {({ field, form: { setFieldValue } }) => (
        <>
          <label htmlFor={value} className={classNames('option option--fullWidth grid-x align-middle', { 'option--selected': field.value === value })}>
            <input
              style={{ display: 'none' }}
              id={value}
              value={value}
              type='radio'
              checked={field.value === value}
              onChange={(e) => {
                if (value === 'new') {
                  setFieldValue('existingToken', '')
                  setFieldValue('customToken', '')
                } else {
                  setFieldValue('communityType', '')
                  setFieldValue('customToken', '')
                }
                setFieldValue('currency', e.target.value)
              }}
            />
            <div className='option__logo grid-x align-center cell small-4'>
              <img src={logo} />
            </div>
            <div className='option__text option__text--big cell large-auto'>
              {name}
            </div>
          </label>
        </>
      )}
    </Field>
  )
}

const ChooseCurrencyType = () => {
  const formik = useFormikContext()
  const account = useSelector(getAccount)
  const communityName = getIn(formik.values, 'communityName')
  const hasBalance = getIn(formik.values, 'hasBalance')
  const currency = getIn(formik.values, 'currency')
  const accountAddress = useSelector(state => getAccountAddress(state))
  const [delay, setDelay] = useState(null)
  const dispatch = useDispatch()
  const { jobId, fundingStatus, fundingTxHash } = useSelector(state => state.screens.issuance)

  const handleFund = (e) => {
    e.preventDefault()
    dispatch(fund(accountAddress))
  }

  useEffect(() => {
    if (jobId) {
      setDelay(CONFIG.web3.bridge.pollingTimeout)
    }
  }, [jobId])

  useEffect(() => {
    if (fundingStatus) {
      setDelay(null)
    }
  }, [fundingStatus])

  useInterval(() => {
    dispatch(fetchFundingStatus())
  }, delay)

  useEffect(() => {
    if (currency === 'new') {
      formik.setFieldValue('communitySymbol', nameToSymbol(communityName))
    }
  }, [currency])

  return (
    <div className='options__wrapper grid-y align-spaced'>
      <div className='title'>Please choose one of the following options:</div>
      <div className='options grid-x'>
        <CurrencyOption
          logo={createNewToken}
          name='Create a new token'
          value='new'
        />
        <CurrencyOption
          logo={existingToken}
          name='Use an existing token on Fuse'
          value='existing'
        />
      </div>
      {
        accountAddress && !hasBalance && !delay && (
          <div className='error'>
            <span>
              You need at least 0.01 FUSE (you have <span>{account && account.home ? formatWei((account.home), 2) : 0}</span> FUSE).
            </span>
            &nbsp;
            <button
              onClick={handleFund}
              className='link'
              style={{ display: 'inline-block' }}
            >
              <span>Click here to get 0.01 FUSE</span>
            </button>
          </div>
        )
      }

      {
        delay && (
          <div className='pending shrink grid-x' style={{ position: 'relative' }}>
            Pending&nbsp;&nbsp;
            <div className='loader'>
              <div className='loader__circle' />
            </div>
            {
              fundingTxHash && (
                <a target='_blank' rel='noopener noreferrer' style={{ marginLeft: '5px' }} href={`${getBlockExplorerUrl('fuse')}/tx/${fundingTxHash}`}>
                  <FontAwesome style={{ fontSize: '14px' }} name='external-link-alt' />
                </a>
              )
            }
          </div>
        )
      }

      {
        !delay && fundingStatus === 'failed' && (
          <div className='error'>
            <span>Something went wrong</span>
          </div>
        )
      }

      {
        !delay && fundingStatus === 'success' && (
          <div className='pending shrink grid-x'>
            <span>Sent successfully&nbsp;&nbsp;</span>
            {
              fundingTxHash && (
                <a target='_blank' rel='noopener noreferrer' style={{ marginLeft: '5px' }} href={`${getBlockExplorerUrl('fuse')}/tx/${fundingTxHash}`}>
                  <FontAwesome style={{ fontSize: '14px' }} name='external-link-alt' />
                </a>
              )
            }
          </div>
        )
      }
    </div>
  )
}

export default ChooseCurrencyType
