import { object, string, number } from 'yup'

export default (maxValue) => object().shape({
  to: string().normalize().label('To').required().isAddress(),
  amount: number().required().max(maxValue)
})
