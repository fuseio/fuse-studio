import React from 'react'
import get from 'lodash/get'
import { useStore } from 'store/mobx'
import { observer } from 'mobx-react'
import TextField from '@material-ui/core/TextField'
import BannerImage from 'components/FuseDashboard/components/BannerImage'
import { Formik } from 'formik'
import { object, string } from 'yup'
import { isIpfsHash, isS3Hash } from 'utils/metadata'

const Scheme = object().noUnknown(false).shape({
  link: string().url('Must be link').normalize()
})

const WalletBannerLinkForm = observer(() => {
  const { dashboard } = useStore()
  const plugin = get(dashboard?.plugins, 'walletBanner', {})
  const onSubmit = (values, formikBag) => {
    const { link, walletBanner } = values
    dashboard.setWalletBannerLink(link, walletBanner)
    formikBag.resetForm({ values })
  }

  const renderForm = ({ handleSubmit, isValid, values, handleChange }) => {
    const { link } = values
    return (
      <form onSubmit={handleSubmit} className='join_bonus__container'>
        <div className='join_bonus__field'>
          <div className='join_bonus__title' style={{ paddingBottom: '1em' }}>Link</div>
          <TextField
            type='text'
            name='link'
            placeholder='Insert Link'
            classes={{
              root: 'join_bonus__field'
            }}
            inputProps={{
              autoComplete: 'off',
              value: link
            }}
            InputProps={{
              classes: {
                underline: 'join_bonus__field--underline',
                error: 'join_bonus__field--error'
              }
            }}
            onChange={handleChange}
          />
        </div>
        <BannerImage />
        <div className='join_bonus__actions'>
          <button className='button button--normal join_bonus__button' disabled={!isValid}>Save</button>
        </div>
      </form>
    )
  }

  return (
    <Formik
      initialValues={{
        link: '' || plugin?.link,
        walletBanner: isIpfsHash(plugin?.walletBannerHash)
          ? `${CONFIG.ipfsProxy.urlBase}/image/${plugin?.walletBannerHash}`
          : isS3Hash(plugin?.walletBannerHash)
            ? `https://${CONFIG.aws.s3.bucket}.s3.amazonaws.com/${plugin?.walletBannerHash}`
            : ''
      }}
      validationSchema={Scheme}
      render={renderForm}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnChange
    />
  )
})

const WalletBannerLink = () => {
  const { dashboard } = useStore()
  return (
    dashboard?.community
      ? (
        <>
          <div className='join_bonus__header'>
            <h2 className='join_bonus__header__title'>Wallet banner link</h2>
          </div>
          <div className='join_bonus__wrapper'>
            <WalletBannerLinkForm
              setWalletBannerLink={dashboard?.setWalletBannerLink}
            />
          </div>
        </>
        )
      : <div />
  )
}

export default observer(WalletBannerLink)
