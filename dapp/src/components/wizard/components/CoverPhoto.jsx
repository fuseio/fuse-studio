import React, { useEffect } from 'react'
import { connect, getIn } from 'formik'
import { createObjectURL } from 'utils/images'
import cameraIcon from 'images/camara.svg'
import DefaultCover from 'images/default_cover.png'
import isEmpty from 'lodash/isEmpty'
const CoverPhoto = ({
  formik
}) => {
  const coverPhoto = getIn(formik.values, 'coverPhoto')
  const onSelectFile = async (event) => {
    event.preventDefault()
    const image = event.target.files[0]
    window.URL.revokeObjectURL(image)
    const croppedImageUrl = createObjectURL(image)
    formik.setFieldValue('coverPhoto', {
      croppedImageUrl,
      blob: image
    })
  }

  const imageConverter = (image, field) => {
    if (coverPhoto && !isEmpty(coverPhoto)) {
      return
    }

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

  useEffect(() => {
    imageConverter(DefaultCover, 'coverPhoto')
  }, [])

  return (
    <div className='cover_photo cell large-auto'>
      <div className='cover_photo__title'>Community cover photo</div>
      <label
        htmlFor='coverPhotoUpload'
        className='cover_photo__label'
      >
        <div onClick={(e) => {
          e.stopPropagation()
        }} className='use_custom'>
          <img src={cameraIcon} />
        </div>
        <input accept='image/*' name='coverPhoto' id='coverPhotoUpload' type='file' style={{ opacity: '0', display: 'none' }} onChange={event => onSelectFile(event)} />
        <img style={{ maxHeight: '100%', maxWidth: '100%', width: '100%', height: '100%' }} src={(coverPhoto && coverPhoto.croppedImageUrl) ? coverPhoto.croppedImageUrl : coverPhoto} />
      </label>
    </div>
  )
}

export default connect(CoverPhoto)
