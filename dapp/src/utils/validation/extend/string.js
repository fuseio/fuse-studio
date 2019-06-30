import { addMethod, string } from 'yup'
import { isAddress } from 'web3-utils'

addMethod(string, 'normalize', function yupNormalize () {
  return this.trim().ensure()
})

addMethod(string, 'isAddress', function yupIsAddress (address, message = 'Address is not valid') {
  return this.test({
    name: 'some',
    message,
    test: (address) => isAddress(address)
  })
})
