import React from 'react'
import SignIcon from 'images/sign_icon.svg'
import classNames from 'classnames'

export default ({ clickHandler, frontText = 'Send', backText = 'Sign', disabled, type = 'button' }) => (
  <div className='button-flip__wrapper' onClick={clickHandler} role='button'>
    <div className={classNames(`button-flip`, { 'button-flip--disabled': disabled, 'button-flip--active': !disabled })}>
      <button type={type} className='button-flip__front' disabled={disabled}>{frontText}</button>
      <button type={type} className='button-flip__back'>
        <a style={{ backgroundImage: `url(${SignIcon})` }} />
        <span>{backText}</span>
      </button>
    </div>
  </div>
)
