require('module-alias/register')
const { expect } = require('chai')
const { getActionsTypes } = require('@utils/wallet/actions/utils')

describe('getActionsTypes', () => {
  it('swapTokens type', () => {
    const job = {
      name: 'relay',
      data: {
        walletModule: 'TransferManager',
        methodName: 'approveTokenAndCallContract',
        methodData: '0x2df546f4000000000000000000000000af21fb07aed5f2fcb2664b67f1f9a9de5faf4de0000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000057520b81f4045f883fd0a16353adfa1480c86c2800000000000000000000000000000000000000000000000fb88ef7839f48000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000'
      }
    }
    console.log(getActionsTypes(job))
    expect(getActionsTypes(job)).to.equal('swapTokens')
  })
})
