import { object, mixed, number } from 'yup'

export default (maxValue) => object().shape({
  actionType: mixed().oneOf(['mint', 'burn']),
  mintAmount: number().positive().label('Amount').when('actionType', (actionType, schema) => {
    return actionType === 'mint' ? schema.required() : schema.notRequired()
  }),
  burnAmount: number().max(maxValue).label('Amount').when('actionType', (actionType, schema) => {
    return actionType === 'burn' ? schema.required() : schema.notRequired()
  })
})
