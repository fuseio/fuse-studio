import { object, string } from 'yup'

export default object().noUnknown(false).shape({
  name: string().normalize().label('Name').required(),
  address: string().normalize().max(90),
  email: string().email(),
  phone: string().normalize(),
  websiteUrl: string().normalize(),
  description: string().normalize().label('Description').max(490),
  type: string().normalize().required(),
  account: string().normalize().required().isAddress(),
  selectedType: object().shape({
    label: string().normalize(),
    value: string().normalize()
  })
})
