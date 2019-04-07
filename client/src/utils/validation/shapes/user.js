import { string, object, boolean } from 'yup'

const regaxLetters = /^[a-zA-Z]+$/

export default object().noUnknown(false).shape({
  firstName: string().trim().ensure().label('First name').required().matches(regaxLetters, 'Please type only letters'),
  lastName: string().trim().ensure().label('Last name').required().matches(regaxLetters, 'Please type only letters'),
  email: string().email().required(),
  subscribe: boolean().default(true),
  country: object().shape({
    label: string(),
    value: string()
  })
})
