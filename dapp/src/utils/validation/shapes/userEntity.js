import { string, object, mixed } from 'yup'

export default object().noUnknown(false).shape({
  name: string().trim().ensure().label('Full name').required(),
  email: string().email(),
  phoneNumber: string(),
  country: object().shape({
    label: string(),
    value: string()
  }),
  status: object().shape({
    label: string(),
    value: string()
  }).nullable(true),
  address: string(),
  account: string().normalize().required().isAddress(),
  image: mixed().nullable(true)
})
