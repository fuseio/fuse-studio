import { object, string, mixed } from 'yup'

export default object().shape({
  inventionType: mixed().oneOf(['email', 'sms']),
  email: string().email().when('inventionType', {
    is: inventionType => inventionType === 'sms',
    then: string(),
    otherwise: string().required()
  }),
  phoneNumber: string().when('inventionType', {
    is: inventionType => inventionType === 'email',
    then: string(),
    otherwise: string().phone().required()
  })
})
