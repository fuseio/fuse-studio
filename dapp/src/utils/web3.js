const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const isZeroAddress = (address) => address === ZERO_ADDRESS

export const zeroAddressToNull = (address) => isZeroAddress(address) ? null : address
