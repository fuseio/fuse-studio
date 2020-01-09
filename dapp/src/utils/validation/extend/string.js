import { addMethod, string } from 'yup'
import { isAddress, toChecksumAddress } from 'web3-utils'
import { PhoneNumberUtil } from 'google-libphonenumber'

const phoneUtil = PhoneNumberUtil.getInstance()
const CLDR_REGION_CODE_SIZE = 2

const isValidCountryCode = (countryCode) =>
  typeof countryCode === 'string' &&
  countryCode.length === CLDR_REGION_CODE_SIZE

addMethod(string, 'normalize', function yupNormalize () {
  return this.trim().ensure()
})

addMethod(string, 'toCheckSum', function yupCheckSum (value, originalvalue) {
  return this.transform(function (value) {
    return (this.isType(value) && value) ? toChecksumAddress(value) : value
  })
})

// addMethod(string, 'toCheckSum', function yupToCheckSum () {
//   return toChecksumAddress

// })

addMethod(string, 'isAddress', function yupIsAddress (address, message = 'Address is not valid') {
  return this.test({
    name: 'some',
    message,
    test: (address) => isAddress(address)
  })
})

addMethod(string, 'phone', function yupPhone (
  countryCode = '',
  strict = false
) {
  const errMsg = isValidCountryCode(countryCode)
    ? `\${path} must be a valid phone number for region ${countryCode}`
    : `\${path} must be a valid phone number.`
  return this.test('phone', errMsg, (value) => {
    if (!isValidCountryCode(countryCode)) {
      // if not valid countryCode, then set default country to India (IN)
      countryCode = 'IN'
      strict = false
    }

    const phoneNumber = phoneUtil.parseAndKeepRawInput(value, countryCode)

    if (!phoneUtil.isPossibleNumber(phoneNumber)) {
      return false
    }

    const regionCodeFromPhoneNumber = phoneUtil.getRegionCodeForNumber(
      phoneNumber
    )

    /* check if the countryCode provided should be used as
       default country code or strictly followed
     */
    return strict
      ? phoneUtil.isValidNumberForRegion(phoneNumber, countryCode)
      : phoneUtil.isValidNumberForRegion(
        phoneNumber,
        regionCodeFromPhoneNumber
      )
  })
})
