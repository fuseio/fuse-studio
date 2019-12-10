import React, { useEffect, useCallback } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import CommunityLogo from 'components/common/CommunityLogo'
import { loadModal, hideModal } from 'actions/ui'
import { IMAGE_CROPPER_MODAL } from 'constants/uiConstants'
import { connect as connectFormik, getIn, Field } from 'formik'
import TetherCoin from 'images/tether_logo.svg'
import tokenOne from 'images/CoinIcon1.svg'
import tokenTwo from 'images/CoinIcon2.svg'
import dai from 'images/dai.png'
import usdc from 'images/usdc.png'
import cameraIcon from 'images/camara.svg'
import { createObjectURL } from 'utils/images'

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
          croppedImageUrl = createObjectURL(blob)
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

  const setDefaultImages = useCallback(() => {
    if (existingToken && existingToken.label && existingToken.value) {
      const { symbol } = existingToken
      imageConverter(TokenIcons[symbol], 'images.defaultOne')
    } else {
      imageConverter(TokenIcons[2], 'images.defaultOne')
    }
  }, [communitySymbol, existingToken])

  useEffect(() => {
    setDefaultImages()
  }, [])

  useEffect(() => {
    setDefaultImages()
  }, [setDefaultImages])

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

  return (
    <div className='attributes__attribute cell medium-8'>
      <h3 className='attributes__title'>
        Community Logo
      </h3>
      <Field
        key='defaultOne'
        name='images.defaultOne'
        render={({ field, form: { setFieldValue } }) => {
          return (
            <div onClick={() => {
              setFieldValue('images.chosen', 'defaultOne')
              if (window && window.analytics) {
                window.analytics.track(`Choose logo - defaultOne`)
              }
            }} className={classNames('attributes__logo', { 'attributes__logo--chosen': chosen === 'defaultOne' })}>
              <label htmlFor='logoUpload' className='use_custom'>
                <input id='logoUpload' type='file' style={{ opacity: '0', display: 'none' }} onChange={onSelectFile} />
                <img src={cameraIcon} />
              </label>
              <CommunityLogo
                metadata={{
                  isDefault: communityType && communityType.value && communityType.label
                }}
                symbol={communitySymbol}
                imageUrl={(custom && custom.croppedImageUrl) || (field && field.value && field.value.croppedImageUrl)}
              />
            </div>
          )
        }}
      />
    </div>
  )
}

const mapDispatchToProps = {
  loadModal,
  hideModal
}

export default connect(null, mapDispatchToProps)(connectFormik(LogosOptions))
