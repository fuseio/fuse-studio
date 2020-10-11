import React from 'react'
import TextField from '@material-ui/core/TextField'
import BannerImage from 'components/dashboard/components/BannerImage'
import { Formik } from 'formik'
import { object, string } from 'yup'
import { isIpfsHash, isS3Hash } from 'utils/metadata'

const Scheme = object().noUnknown(false).shape({
  link: string().url('Must be link').normalize()
})

const WalletBannerLinkForm = (props) => {
  const { plugin: { link, walletBannerHash }, setWalletBannerLink } = props
  const onSubmit = (values, formikBag) => {
    const { link, walletBanner } = values
    setWalletBannerLink(link, walletBanner)
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
        link: '' || link,
        walletBanner: isIpfsHash(walletBannerHash)
          ? `${CONFIG.ipfsProxy.urlBase}/image/${walletBannerHash}`
          : isS3Hash(walletBannerHash)
            ? `https://${CONFIG.aws.s3.bucket}.s3.amazonaws.com/${walletBannerHash}`
            : ''
      }}
      validationSchema={Scheme}
      render={renderForm}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnChange
    />
  )
}

export default WalletBannerLinkForm
