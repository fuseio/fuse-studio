import React from 'react'
import { connect, getIn } from 'formik'
import { createObjectURL } from 'utils/images'
import cameraIcon from 'images/camara.svg'

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
        <img style={{ maxHeight: '100%', maxWidth: '100%', width: '100%', height: '100%' }} src={(coverPhoto && coverPhoto.croppedImageUrl)} />
      </label>
    </div>
  )
}

export default connect(CoverPhoto)
