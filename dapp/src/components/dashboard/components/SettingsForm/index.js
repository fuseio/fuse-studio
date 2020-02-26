import React, { Component } from 'react'
import CoverPhoto from 'components/wizard/components/CoverPhoto'
import LogosOptions from 'components/wizard/components/LogosOptions'
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/styles'
import get from 'lodash/get'
import { Formik } from 'formik'

const ExpansionPanelDetails = withStyles({
  root: {
    display: 'flex',
    padding: '24px'
  }
})(MuiExpansionPanelDetails)

class SettingsForm extends Component {
  renderForm = ({ isValid, handleSubmit }) => {
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
          <div className='join_bonus__actions'>
            <button className='button button--normal join_bonus__button' disabled={!isValid}>Save</button>
          </div>
        </div>
      </form>
    )
  }

  onSubmit = (values, formikBag) => {
    const { updateCommunityMetadata, community } = this.props
    const metadata = {}
    if (get(values, 'images.custom.blob')) {
      metadata.image = get(values, 'images.custom.blob')
    }
    if (get(values, 'coverPhoto.blob')) {
      metadata.coverPhoto = get(values, 'coverPhoto.blob')
    }
    updateCommunityMetadata(community.communityAddress, metadata)
    formikBag.resetForm(values)
  }

  render = () => {
    const { isClosed } = this.props.community
    const { symbol } = this.props.token
    const { coverPhoto, image, isDefault } = this.props.communityMetadata
    const initialValues = {
      communityType: {
        label: isDefault,
        value: isDefault
      },
      isOpen: !isClosed,
      coverPhoto: coverPhoto ? `${CONFIG.ipfsProxy.urlBase}/image/${coverPhoto}` : '',
      images: {
        custom: {
          croppedImageUrl: `${CONFIG.ipfsProxy.urlBase}/image/${image}`
        }
      },
      communitySymbol: symbol
    }
    return (
      <Formik
        render={this.renderForm}
        onSubmit={this.onSubmit}
        initialValues={initialValues} />
    )
  }
}

export default SettingsForm
