
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const isZeroAddress = (address) => address === ZERO_ADDRESS

export const zeroAddressToNull = (address) => isZeroAddress(address) ? null : address

export const generateSignatureData = ({ accountAddress, date, chainId }) => {
  return { types: {
    EIP712Domain: [
      { name: 'name', type: 'string' }, { name: 'version', type: 'string' }, { name: 'chainId', type: 'uint256' }
    ],
    Person: [{ name: 'wallet', type: 'address' }],
    Login: [
      { name: 'account', type: 'string' },
      { name: 'date', type: 'string' },
      { name: 'content', type: 'string' }
    ]
  },
  primaryType: 'Login',
  domain: { ...CONFIG.api.auth.domain, chainId },
  message: { account: accountAddress, date, content: 'Login request' }
  }
}
