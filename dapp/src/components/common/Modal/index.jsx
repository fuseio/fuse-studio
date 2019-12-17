import React, { useEffect } from 'react'
import classNames from 'classnames'
import CloseButton from 'images/x.png'
import CloseButtonWhite from 'images/x_white.svg'

const Modal = ({
  onClose,
  children,
  hasCloseBtn,
  className,
  whiteClose
}) => {
  useEffect(() => {
    if (onClose) {
      window.addEventListener('keydown', listenKeyboard.bind(this), true)
    }

    return () => {
      window.removeEventListener('keydown', listenKeyboard.bind(this), true)
    }
  }, [onClose])

  const listenKeyboard = (event) => {
    if (event.key === 'Escape' || event.keyCode === 27) {
      onDialogClick()
      onClose()
    }
  }

  const onDialogClick = (event) => event.stopPropagation()

  return (
    <div className='modal'>
      <div className='overlay' />
      <div className='modal__container'>
        <div className={classNames('modal__content', className)}>
          {
            hasCloseBtn && (
              <div className='modal__content__close' onClick={onClose}>
                <img src={whiteClose ? CloseButtonWhite : CloseButton} />
              </div>
            )
          }
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
