import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { isMobileOnly } from 'react-device-detect'
import classNames from 'classnames'
import CommunityLogo from 'components/common/CommunityLogo'
import Carousel from 'components/common/Carousel'
import UploadImage from 'images/upload_picture.svg'
import { loadModal, hideModal } from 'actions/ui'
import { IMAGE_CROPPER_MODAL } from 'constants/uiConstants'
import { connect as connectFormik, getIn, Field } from 'formik'
import TetherCoin from 'images/tether_logo.svg'
import tokenOne from 'images/CoinIcon1.svg'
import tokenTwo from 'images/CoinIcon2.svg'
import dai from 'images/dai.png'
import usdc from 'images/usdc.png'

const TokenIcons = {
  1: tokenOne,
  2: tokenTwo,
  DAI: dai,
  USDC: usdc,
  USDT: TetherCoin
}

const LogosOptions = ({
  loadModal,
  formik
}) => {
  const imagesValues = getIn(formik.values, 'images')
  const communityType = getIn(formik.values, 'communityType')
  const communitySymbol = getIn(formik.values, 'communitySymbol')
  const existingToken = getIn(formik.values, 'existingToken')

  const { chosen, custom } = imagesValues

  const imageConverter = (image, field) => {
    let img = new window.Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      return new Promise(resolve => {
        canvas.toBlob(blob => {
          blob.name = 'newFile.jpeg'
          let croppedImageUrl
          window.URL.revokeObjectURL(croppedImageUrl)
          croppedImageUrl = window.URL.createObjectURL(blob)
          formik.setFieldValue(field, {
            croppedImageUrl: canvas.toDataURL(),
            blob
          })
          resolve({
            croppedImageUrl,
            blob
          })
        }, 'image/jpeg')
      })
    }

    img.src = image
  }

  const setDefaultImages = () => {
    if (existingToken && existingToken.label && existingToken.value) {
      const { symbol } = existingToken
      imageConverter(TokenIcons[symbol], 'images.defaultOne')
      formik.setFieldValue('images.defaultTwo', '')
    } else {
      imageConverter(TokenIcons[1], 'images.defaultOne')
      imageConverter(TokenIcons[2], 'images.defaultTwo')
    }
  }

  React.useMemo(() => {
    setDefaultImages()
  }, [])

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
      setImages: (values) => {
        formik.setFieldValue('images.custom', values)
        formik.setFieldValue('images.chosen', 'custom')
        if (window && window.analytics) {
          window.analytics.track(`Choose logo - custom`)
        }
      }
    })
  }

  const items = React.useMemo(() => {
    return (
      <Fragment>
        <Field
          name='images.defaultOne'
          render={({ field, form: { setFieldValue } }) => {
            return (
              <div onClick={() => {
                setFieldValue('images.chosen', 'defaultOne')
                if (window && window.analytics) {
                  window.analytics.track(`Choose logo - defaultOne`)
                }
              }} className={classNames('attributes__logos__item', { 'attributes__logos__item--chosen': chosen === 'defaultOne' })}>
                <CommunityLogo
                  metadata={{
                    isDefault: communityType && communityType.value && communityType.label
                  }}
                  symbol={communitySymbol}
                  imageUrl={field && field.value && field.value.croppedImageUrl}
                />
              </div>
            )
          }}
        />
        {
          imagesValues && imagesValues.defaultTwo && imagesValues.defaultTwo.croppedImageUrl ? (
            <Field
              name='images.defaultTwo'
              render={({ field, form: { setFieldValue } }) => {
                return (
                  <div onClick={() => {
                    setFieldValue('images.chosen', 'defaultTwo')
                    if (window && window.analytics) {
                      window.analytics.track(`Choose logo - defaultTwo`)
                    }
                  }} className={classNames('attributes__logos__item', { 'attributes__logos__item--chosen': chosen === 'defaultTwo' })}>
                    <CommunityLogo
                      symbol={communitySymbol}
                      imageUrl={field && field.value && field.value.croppedImageUrl}
                      metadata={{
                        isDefault: communityType && communityType.value && communityType.label
                      }}
                    />
                  </div>
                )
              }}
            />
          ) : null
        }
        <label
          htmlFor='logoUpload'
          className={classNames({
            'attributes__logos__item': true,
            'attributes__logos__item--chosen': chosen === 'custom'
          })}
        >
          <input id='logoUpload' type='file' style={{ opacity: '0', display: 'none' }} onChange={onSelectFile} />
          <img style={{ borderRadius: '50%', maxWidth: '60px' }} src={(custom && custom.croppedImageUrl) || UploadImage} />
        </label>
      </Fragment>
    )
  }, [imagesValues])

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
