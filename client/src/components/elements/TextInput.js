import React from 'react'
import { isMobile } from 'react-device-detect'
import classnames from 'classnames'
import Select from './Select'

const options = [
  { value: 'Buy & Sell CLN / CC', label: 'Buy & Sell CLN / CC' },
  { value: 'Issue new coin', label: 'Issue new coin' },
  { value: 'Partnerships', label: 'Partnerships' },
  { value: 'Technical Issue', label: 'Technical Issue' },
  { value: 'General Inquiry', label: 'General Inquiry' }
]

const InputFeedback = ({ error }) =>
  error ? (
    <div className='input-feedback'>{error}</div>
  ) : null

const Label = ({
  className,
  children,
  ...props
}) => {
  return (
    <label className='label' {...props}>
      {children}
    </label>
  )
}

const TextInput = ({
  fieldType,
  type,
  id,
  label,
  error,
  value,
  onChange,
  className,
  setFieldValue,
  children,
  ...props
}) => {
  const classes = classnames(
    'contact-field-wrapper',
    {
      'checkbox': fieldType === 'checkbox',
      'error': !!error
    },
    className
  )
  let field
  switch (fieldType) {
    case 'textarea': {
      field = <textarea
        id={id}
        className='text-input'
        type={type}
        value={value}
        onChange={onChange}
        style={{ height: isMobile ? 'auto' : '52px' }}
        {...props}
      />
      break
    }
    case 'select': {
      field = <Select id={id} value={value} setFieldValue={setFieldValue} options={options} {...props} />
      break
    }
    case 'checkbox': {
      field = <input
        id={id}
        type={type}
        checked={value}
        onChange={onChange}
        {...props} />
      break
    }
    default: {
      field = <input
        id={id}
        className='text-input'
        type={type}
        value={value}
        onChange={onChange}
        {...props} />
      break
    }
  }
  return (
    <div className={classes}>
      <Label htmlFor={id} error={error || ''}>
        {label}
      </Label>
      {field}
      <InputFeedback error={error || ''} />
    </div>
  )
}

export default TextInput
