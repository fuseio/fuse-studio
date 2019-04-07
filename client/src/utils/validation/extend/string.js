import { addMethod, string } from 'yup'

addMethod(string, 'normalize', function yupNormalize () {
  return this.trim().ensure()
})
