import { object, mixed } from 'yup'

export default object().shape({
  plugin: mixed().oneOf(['moonpay', 'transak', 'rampInstant'])
})
