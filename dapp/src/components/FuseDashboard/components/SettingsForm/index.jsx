import React from 'react'
import CoverPhoto from 'components/wizard/components/CoverPhoto'
import LogosOptions from 'components/wizard/components/LogosOptions'
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/styles'
import get from 'lodash/get'
import set from 'lodash/set'
import isEmpty from 'lodash/isEmpty'
import { toChecksumAddress } from 'web3-utils'
import { getCoverPhotoUri, getImageUri } from 'utils/metadata'
import { Formik } from 'formik'
import { Observer } from 'mobx-react'

const ExpansionPanelDetails = withStyles({
  root: {
    display: 'flex',
    padding: '24px'
  }
})(MuiExpansionPanelDetails)

const SettingsForm = ({ community, updateCommunityMetadata, setSecondaryToken, token, communityMetadata }) => {
  const renderForm = ({ isValid, handleSubmit, handleChange, values }) => {
    return (
      <form onSubmit={handleSubmit} className='issuance__wizard'>
        <div className='settings__form'>
          <ExpansionPanelDetails className='accordion__panel'>
            <Typography component='div'>
              <div className='grid-x'>
                <LogosOptions />
                <CoverPhoto />
              </div>
            </Typography>
          </ExpansionPanelDetails>
          <ExpansionPanelDetails className='accordion__panel'>
            <Typography component='div'>
              <div className='grid-x field'>
                <h3 className='field__title'>Secondary Token</h3>
                <TextField
                  name='secondaryTokenAddress'
                  fullWidth
                  value={values.secondaryTokenAddress}
                  type='string'
                  autoComplete='off'
                  margin='none'
                  onChange={handleChange}
                  InputProps={{
                    classes: {
                      underline: 'user-form__field__underline',
                      error: 'user-form__field__error'
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                    className: 'user-form__field__label'
                  }}
                />
              </div>
            </Typography>
          </ExpansionPanelDetails>
          <ExpansionPanelDetails className='accordion__panel'>
            <Typography component='div'>
              <div className='grid-x field'>
                <h3 className='field__title'>Community Description</h3>
                <TextField
                  name='description'
                  fullWidth
                  value={values.description}
                  type='string'
                  autoComplete='off'
                  margin='none'
                  multiline
                  onChange={handleChange}
                  InputProps={{
                    classes: {
                      underline: 'user-form__field__underline',
                      error: 'user-form__field__error'
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                    className: 'user-form__field__label'
                  }}
                />
              </div>
            </Typography>
          </ExpansionPanelDetails>
          <ExpansionPanelDetails className='accordion__panel'>
            <Typography component='div'>
              <div className='grid-x field'>
                <h3 className='field__title'>Community Webpage URL</h3>
                <TextField
                  name='webUrl'
                  fullWidth
                  value={values.webUrl}
                  type='string'
                  autoComplete='off'
                  margin='none'
                  onChange={handleChange}
                  InputProps={{
                    classes: {
                      underline: 'user-form__field__underline',
                      error: 'user-form__field__error'
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                    className: 'user-form__field__label'
                  }}
                />
              </div>
            </Typography>
          </ExpansionPanelDetails>
          <div className='join_bonus__actions'>
            <button className='button button--normal join_bonus__button' disabled={!isValid}>Save</button>
          </div>
        </div>
      </form>
    )
  }

  const onSubmit = (values, formikBag) => {
    const fields = {
    }
    if (get(values, 'images.custom.blob')) {
      set(fields, 'metadata.image', get(values, 'images.custom.blob'))
    }
    if (get(values, 'coverPhoto.blob')) {
      set(fields, 'metadata.coverPhoto', get(values, 'coverPhoto.blob'))
    }
    if (community.description !== values.description) {
      fields.description = values.description
    }
    if (community.webUrl !== values.webUrl) {
      fields.webUrl = values.webUrl
    }
    if (!isEmpty(fields)) {
      updateCommunityMetadata(community.communityAddress, fields)
    }

    if (values.secondaryTokenAddress && community.secondaryTokenAddress !== toChecksumAddress(values.secondaryTokenAddress)) {
      setSecondaryToken(community.communityAddress, toChecksumAddress(values.secondaryTokenAddress))
    }
    formikBag.resetForm({
      values
    })
  }

  // const initialValues = React.useMemo(() => ({
  //   communityType: {
  //     label: get(communityMetadata, 'isDefault', false),
  //     value: get(communityMetadata, 'isDefault', false)
  //   },
  //   isOpen: get(community, 'isClosed', true),
  //   coverPhoto: getCoverPhotoUri(communityMetadata),
  //   images: {
  //     custom: {
  //       croppedImageUrl: getImageUri(communityMetadata)
  //     }
  //   },
  //   communitySymbol: get(token, 'symbol', ''),
  //   secondaryTokenAddress: get(community, 'secondaryTokenAddress', ''),
  //   description: get(community, 'description', ''),
  //   webUrl: get(community, 'webUrl', '')
  // }), [communityMetadata, token, community])
  const initialValues = {
    communityType: {
      label: get(communityMetadata, 'isDefault', false),
      value: get(communityMetadata, 'isDefault', false)
    },
    isOpen: get(community, 'isClosed', true),
    coverPhoto: getCoverPhotoUri(communityMetadata),
    images: {
      custom: {
        croppedImageUrl: getImageUri(communityMetadata)
      }
    },
    communitySymbol: get(token, 'symbol', ''),
    secondaryTokenAddress: get(community, 'secondaryTokenAddress', ''),
    description: get(community, 'description', ''),
    webUrl: get(community, 'webUrl', '')
  }

  return (
    <Formik
      render={renderForm}
      onSubmit={onSubmit}
      initialValues={initialValues}
    />
  )
}

export default SettingsForm
