import { addMethod, string } from 'yup'
import web3 from 'web3'

addMethod(string, 'normalize', function yupNormalize () {
  return this.trim().ensure()
})

addMethod(string, 'isAddress', function yupIsAddress (address, message = 'Address is not valid') {
  return this.test({
    name: 'some',
    message,
    test: (address) => web3.utils.isAddress(address)
  })
})
