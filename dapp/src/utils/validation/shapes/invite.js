import { object, string, mixed } from 'yup'

export default object().shape({
  invitationType: mixed().oneOf(['email', 'sms']),
  email: string().email().when('invitationType', {
    is: invitationType => invitationType === 'sms',
    then: string(),
    otherwise: string().required()
  }),
  phoneNumber: string().when('invitationType', {
    is: invitationType => invitationType === 'email',
    then: string(),
    otherwise: string().phone().required()
  })
})
