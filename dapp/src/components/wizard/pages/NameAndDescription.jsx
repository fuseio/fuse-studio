import React, { useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import { Field, ErrorMessage, useFormikContext, getIn } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { getAccount, getProviderInfo } from 'selectors/accounts'
import { formatWei } from 'utils/format'
import { getCurrentNetworkType } from 'selectors/network'
import { loadModal } from 'actions/ui'
import { changeNetwork } from 'actions/network'
import { SWITCH_NETWORK } from 'constants/uiConstants'

const NameAndDescription = () => {
  const formik = useFormikContext()
  const networkType = useSelector(getCurrentNetworkType)
  const dispatch = useDispatch()
  const providerInfo = useSelector(getProviderInfo)
  const account = useSelector(getAccount)
  const network = getIn(formik.values, 'network')

  useEffect(() => {
    const hasBalance = parseFloat(account && account.home ? formatWei((account.home), 2) : '0') > 0.01
    formik.setFieldValue('hasBalance', hasBalance)
  }, [account])

  const loadSwitchModal = () => {
    dispatch(loadModal(SWITCH_NETWORK, { desiredNetworkType: ['fuse'], networkType, goBack: false }))
  }

  const switchNetwork = () => {
    if (providerInfo.type === 'injected') {
      loadSwitchModal()
    } else if (providerInfo.type === 'web') {
      dispatch(changeNetwork(network))
    }
  }

  useEffect(() => {
    if (networkType !== 'fuse') {
      switchNetwork()
    }
  }, [networkType])

  return (
    <div className='name__wrapper'>
      <div className='name'>
        <h3 className='name__title'>Name your economy</h3>
        <Field name='communityName'>
          {({ field }) => (
            <TextField
              {...field}
              type='search'
              placeholder='Name your economy'
              classes={{
                root: 'name__field'
              }}
              inputProps={{
                maxLength: '36',
                autoComplete: 'off'
              }}
              InputProps={{
                classes: {
                  underline: 'name__field--underline',
                  error: 'name__field--error'
                }
              }}
            />
          )}
        </Field>
        <ErrorMessage name='communityName' render={msg => <div className='input-error input-error--block'>{msg}</div>} />
      </div>
      <div className='name'>
        <h3 className='name__title'>Add economy description</h3>
        <Field name='description'>
          {({ field }) => (
            <TextField
              {...field}
              multiline
              placeholder='Add description'
              rows={4}
              variant='standard'
              classes={{
                root: 'name__textarea'
              }}
              fullWidth
              InputProps={{
                classes: {
                  underline: 'name__field--underline',
                  error: 'name__field--error'
                }
              }}
            />
          )}
        </Field>
        <ErrorMessage name='description' render={msg => <div className='input-error input-error--block'>{msg}</div>} />
      </div>
    </div>
  )
}

export default NameAndDescription
