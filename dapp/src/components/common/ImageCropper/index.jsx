import React, { Component } from 'react'
import ReactCrop from 'react-image-crop'
import Modal from 'components/common/Modal'

export default class ImageCropper extends Component {
  state = {
    crop: {
      unit: 'px',
      width: 60,
      aspect: 1
    },
    images: {}
  }

  onImageLoaded = image => {
    this.imageRef = image
  }

  onCropComplete = crop => {
    this.makeClientCrop(crop)
  }

  makeClientCrop = async (crop) => {
    if (this.imageRef && crop.width && crop.height) {
      const { croppedImageUrl, blob } = await this.getCroppedImg(
        this.imageRef,
        crop,
        'newFile.jpeg'
      )
      this.setState({ ...this.state, images: { croppedImageUrl, blob } })
    }
  }

  getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          console.error('Canvas is empty')
          return
        }
        blob.name = fileName
        window.URL.revokeObjectURL(this.fileUrl)
        this.fileUrl = window.URL.createObjectURL(blob)
        resolve({
          croppedImageUrl: this.fileUrl,
          blob
        })
      }, 'image/jpeg')
    })
  }

  render () {
    const {
      hideModal,
      src,
      setImages
    } = this.props

    const { crop } = this.state
    return (
      <Modal className='ReactCrop__wrapper' hasCloseBtn onClose={hideModal}>
        <div className='ReactCrop__header'>
          <h1 className='ReactCrop__title'>Community logo</h1>
        </div>
        <ReactCrop
          src={src}
          circularCrop
          className='ReactCrop'
          onImageLoaded={this.onImageLoaded}
          crop={crop}
          minWidth='50'
          minHeight='50'
          maxWidth='60'
          maxHeight='60'
          onComplete={this.onCropComplete}
          onChange={newCrop => this.setState({ crop: { ...this.state.crop, ...newCrop } })}
        />
        <div className='ReactCrop__footer'>
          <div className='buttons'>
            <button onClick={() => {
              setImages({})
              hideModal()
            }}>Cancel</button>
            <button onClick={() => {
              setImages({ croppedImageUrl: this.state.images.croppedImageUrl, blob: this.state.images.blob })
              hideModal()
            }}>Save</button>
          </div>
        </div>
      </Modal>
    )
  }
}
