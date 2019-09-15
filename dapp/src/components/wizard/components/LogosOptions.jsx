import React from 'react'
import { connect } from 'react-redux'
import { isMobileOnly } from 'react-device-detect'
import classNames from 'classnames'
import CommunityLogo from 'components/common/CommunityLogo'
import Carousel from 'components/common/Carousel'
import UploadImage from 'images/upload_picture.svg'
import { loadModal, hideModal } from 'actions/ui'
import { IMAGE_CROPPER_MODAL } from 'constants/uiConstants'
import { connect as connectFormik, getIn, Field } from 'formik'

const logos = ['CoinIcon1.svg', 'CoinIcon2.svg']

const LogosOptions = ({
  networkType,
  loadModal,
  formik
}) => {
  const imagesValues = getIn(formik.values, 'images')
  const communityLogoValue = getIn(formik.values, 'communityLogo')
  const communityTypeValue = getIn(formik.values, 'communityType')
  const communitySymbol = getIn(formik.values, 'communitySymbol')

  const onSelectFile = e => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new window.FileReader()
      reader.addEventListener('load', () => {
        openImageCropper(reader.result)
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const openImageCropper = (src) => {
    loadModal(IMAGE_CROPPER_MODAL, {
      src,
      setImages: (values) => formik.setFieldValue('images', values)
    })
  }

  const isChosen = (logo) => {
    return communityLogoValue && communityLogoValue.icon && (!imagesValues || !imagesValues.croppedImageUrl) ? communityLogoValue.icon === logo : false
  }

  let items
  if (communityTypeValue && communityTypeValue.value !== 'existingToken') {
    items = logos.map((logo, key) => {
      const logoClass = classNames({
        'attributes__logos__item': true,
        'attributes__logos__item--chosen': isChosen(logo)
      })
      return (
        <Field
          key={key}
          name='communityLogo'
          render={({ field, form: { isSubmitting, setFieldValue } }) => (
            <div className={logoClass} onClick={() => setFieldValue('communityLogo', { name: logo, icon: logos[key] })}>
              <CommunityLogo networkType={networkType} token={{ symbol: communitySymbol }} metadata={{ communityLogo: logos[key] }} />
            </div>
          )}
        />
      )
    })

    items.push((
      <label
        key={3}
        htmlFor='logoUpload'
        className={classNames({
          'attributes__logos__item': true,
          'attributes__logos__item--chosen': (imagesValues && imagesValues.croppedImageUrl)
        })}
      >
        <input id='logoUpload' type='file' style={{ opacity: '0', display: 'none' }} onChange={onSelectFile} />
        <img style={{ borderRadius: '50%', maxWidth: '60px' }} src={(imagesValues && imagesValues.croppedImageUrl) || UploadImage} />
      </label>
    ))
  } else {
    items = logos.map((logo, key) => {
      const logoClass = classNames({
        'attributes__logos__item': true,
        'attributes__logos__item--chosen': isChosen(logo)
      })

      return (
        <Field
          key={key}
          name='communityLogo'
          render={({ field, form: { isSubmitting, setFieldValue } }) => (
            <div className={logoClass} onClick={() => setFieldValue('communityLogo', { name: logo, icon: logos[key] })}>
              <CommunityLogo isDaiToken networkType={networkType} token={{ symbol: communitySymbol }} metadata={{ communityLogo: logos[key] }} />
            </div>
          )}
        />
      )
    })

    items.push((
      <label
        key={3}
        htmlFor='logoUpload'
        className={classNames({
          'attributes__logos__item': true,
          'attributes__logos__item--chosen': (imagesValues && imagesValues.croppedImageUrl)
        })}
      >
        <input id='logoUpload' type='file' style={{ opacity: '0', display: 'none' }} onChange={onSelectFile} />
        <img style={{ borderRadius: '50%', maxWidth: '60px' }} src={(imagesValues && imagesValues.croppedImageUrl) || UploadImage} />
      </label>
    ))
  }

  return (
    <div className='attributes__attribute attributes__attribute--long-height'>
      <h3 className='attributes__title'>
        Community Logo
      </h3>
      <div className='attributes__logos'>
        {
          isMobileOnly ? (
            <Carousel>
              {items}
            </Carousel>
          ) : (
            items
          )
        }
      </div>
    </div>
  )
}

const mapDispatchToProps = {
  loadModal,
  hideModal
}

export default connect(null, mapDispatchToProps)(connectFormik(LogosOptions))
