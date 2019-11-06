import { object, string, mixed } from 'yup'

export default object().noUnknown(false).shape({
  name: string().normalize().label('Name').required(),
  address: string().normalize(),
  email: string().email(),
  phoneNumber: string().normalize(),
  website: string().normalize(),
  description: string().normalize().label('Description').max(490),
  type: string().normalize().required(),
  account: string().normalize().required().isAddress(),
  selectedType: object().shape({
    label: string().normalize(),
    value: string().normalize()
  }),
  image: mixed().notRequired(),
  coverPhoto: mixed().notRequired()
})
