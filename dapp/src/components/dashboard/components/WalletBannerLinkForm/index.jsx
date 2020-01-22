import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import BannerImage from 'components/dashboard/components/BannerImage'
import { Formik } from 'formik'
import { object, string } from 'yup'

class WalletBannerLinkForm extends Component {
  constructor (props) {
    super(props)

    this.initialValues = {
      link: '' || props.plugin.link,
      walletBanner: props.plugin.walletBannerHash ? `${CONFIG.ipfsProxy.urlBase}/image/${props.plugin.walletBannerHash}` : ''
    }

    this.validationSchema = object().noUnknown(false).shape({
      link: string().url('Must be link').normalize()
    })
  }

  onSubmit = (values, formikBag) => {
    const { setWalletBannerLink } = this.props
    const { link, walletBanner } = values
    setWalletBannerLink(link, walletBanner)
    formikBag.resetForm(values)
  }

  renderForm = ({ handleSubmit, isValid, values, handleChange }) => {
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

  render () {
    return (
      <Formik
        initialValues={this.initialValues}
        validationSchema={this.validationSchema}
        render={this.renderForm}
        onSubmit={this.onSubmit}
        enableReinitialize
        validateOnChange
      />
    )
  }
}

export default WalletBannerLinkForm
