import React from 'react'
import { useDispatch } from 'react-redux'
import CoverPhoto from 'components/wizard/components/CoverPhoto'
import LogosOptions from 'components/wizard/components/LogosOptions'
import AccordionDetails from '@material-ui/core/AccordionActions'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/styles'
import get from 'lodash/get'
import set from 'lodash/set'
import isEmpty from 'lodash/isEmpty'
import { toChecksumAddress } from 'web3-utils'
import { getCoverPhotoUri, getImageUri } from 'utils/metadata'
import { Form, Formik } from 'formik'
import { useStore } from 'store/mobx'
import { observer } from 'mobx-react'
import { updateCommunityMetadata, setSecondaryToken } from 'actions/community'

const ExpansionPanelDetails = withStyles({
  root: {
    padding: '24px',
    alignItems: 'flex-start'
  }
})(AccordionDetails)

const SettingsForm = () => {
  const dispatch = useDispatch()
  const { dashboard } = useStore()
  const { community } = dashboard

  const renderForm = ({ isValid, handleChange, values }) => {
    return (
      <Form className='issuance__wizard'>
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
      </Form>
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
      dispatch(updateCommunityMetadata(community.communityAddress, fields))
    }

    if (values.secondaryTokenAddress && community.secondaryTokenAddress !== toChecksumAddress(values.secondaryTokenAddress)) {
      dispatch(setSecondaryToken(community.communityAddress, toChecksumAddress(values.secondaryTokenAddress)))
    }
    formikBag.resetForm({
      values
    })
  }

  const initialValues = {
    communityType: {
      label: get(dashboard, 'metadata.isDefault', false),
      value: get(dashboard, 'metadata.isDefault', false)
    },
    isOpen: get(community, 'isClosed', true),
    coverPhoto: getCoverPhotoUri(get(dashboard, 'metadata')),
    images: {
      custom: {
        croppedImageUrl: getImageUri(get(dashboard, 'metadata'))
      }
    },
    communitySymbol: get(dashboard, 'homeToken.symbol', ''),
    secondaryTokenAddress: get(community, 'secondaryTokenAddress', ''),
    description: get(community, 'description', ''),
    webUrl: get(community, 'webUrl', '')
  }

  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={initialValues}
      enableReinitialize
    >
      {(props) => renderForm(props)}
    </Formik>
  )
}

export default observer(SettingsForm)
