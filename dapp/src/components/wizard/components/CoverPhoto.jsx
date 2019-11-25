import React from 'react'
import { connect, getIn } from 'formik'

const CoverPhoto = ({
  formik
}) => {
  const coverPhoto = getIn(formik.values, 'coverPhoto')

  const onSelectFile = async (event) => {
    const image = event.target.files[0]
    window.URL.revokeObjectURL(image)
    const croppedImageUrl = window.URL.createObjectURL(image)
    formik.setFieldValue('coverPhoto', {
      croppedImageUrl,
      blob: image
    })
  }

  return (
    <div className='cover_photo'>
      <div className='cover_photo__title'>Cover photo</div>
      <label
        htmlFor='coverPhotoUpload'
        className='cover_photo__label'
      >
        <input accept='image/*' name='coverPhoto' id='coverPhotoUpload' type='file' style={{ opacity: '0', display: 'none' }} onChange={event => onSelectFile(event)} />
        <img style={{ maxHeight: '100%', maxWidth: '100%' }} src={(coverPhoto && coverPhoto.croppedImageUrl)} />
      </label>
    </div>
  )
}

export default connect(CoverPhoto)
