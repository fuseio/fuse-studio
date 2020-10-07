import { object, string, number } from 'yup'

export default (maxValue) => object().shape({
  to: string().normalize().label('To').required('This is a required field').isAddress(),
  amount: number().required().max(maxValue).label('Amount')
})
