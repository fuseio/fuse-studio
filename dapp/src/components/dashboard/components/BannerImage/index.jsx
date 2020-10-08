import React from 'react'
import { useFormikContext, getIn } from 'formik'
import { createObjectURL } from 'utils/images'
import cameraIcon from 'images/camara.svg'

const BannerImage = () => {
  const formik = useFormikContext()
  const walletBanner = getIn(formik.values, 'walletBanner')
  const onSelectFile = async (event) => {
    event.preventDefault()
    const image = event.target.files[0]
    window.URL.revokeObjectURL(image)
    const croppedImageUrl = createObjectURL(image)
    formik.setFieldValue('walletBanner', {
      croppedImageUrl,
      blob: image
    })
  }

  return (
    <div className='cover_photo cell large-auto'>
      <div className='cover_photo__title' style={{ paddingBottom: '1em', paddingTop: '1em' }}>Image</div>
      <label
        htmlFor='walletBannerUpload'
        className='cover_photo__label'
      >
        <div style={{ position: 'relative' }}>
          <div onClick={(e) => {
            e.stopPropagation()
          }} style={{ position: 'absolute', right: '7px', top: '2px', cursor: 'pointer' }}>
            <img src={cameraIcon} />
          </div>
          <input accept='image/*' name='walletBanner' id='walletBannerUpload' type='file' style={{ opacity: '0', display: 'none' }} onChange={event => onSelectFile(event)} />
          {walletBanner
            ? <img style={{ maxHeight: '100%', maxWidth: '100%', width: '100%', height: '100%' }} src={(walletBanner && walletBanner.croppedImageUrl) ? walletBanner.croppedImageUrl : walletBanner} />
            : <div style={{ maxHeight: '100%', maxWidth: '100%', width: '100%', height: '12em', backgroundColor: 'grey' }} />
          }
        </div>
      </label>
    </div>
  )
}

export default BannerImage
