require('module-alias/register')
const { expect } = require('chai')
const {
  getActionsTypes
} = require('@utils/wallet/actions/create')

describe('getActionsTypes', () => {
  it('handleSwapExactETHForTokens type', async () => {
    const job = {
      name: 'relay',
      data: {
        walletModule: 'TransferManager',
        methodName: 'approveTokenAndCallContract',
        methodData:
          '0x2df546f4000000000000000000000000af21fb07aed5f2fcb2664b67f1f9a9de5faf4de0000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000057520b81f4045f883fd0a16353adfa1480c86c2800000000000000000000000000000000000000000000000fb88ef7839f48000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
        relayBody: {
          nested: {
            params: {
              amountOutMin: '83259068926050968',
              path: [
                '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
                '0x249BE57637D8B013Ad64785404b24aeBaE9B098B'
              ],
              to: '0x6BA3b80490A4C69e9c5b53daC49249F953FA4dD6',
              deadline: '1630781049'
            },
            contractName: 'FuseswapRouter',
            methodName: 'swapExactETHForTokens'
          },
          params: {
            __length__: 4,
            _wallet: '0x6BA3b80490A4C69e9c5b53daC49249F953FA4dD6',
            _contract: '0xFB76e9E7d88E308aB530330eD90e84a952570319',
            _value: '1000000000000000000',
            _data:
              '0x7ff36ab50000000000000000000000000000000000000000000000000127cbae9baac29800000000000000000000000000000000000000000000000000000000000000800000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd6000000000000000000000000000000000000000000000000000000006133be7900000000000000000000000000000000000000000000000000000000000000020000000000000000000000000be9e53fd7edac9f859882afdda116645287c629000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b'
          },
          contractName: 'TransferManager',
          methodName: 'callContract'
        }
      }
    }
    const actionFunc = getActionsTypes(job)
    expect(actionFunc.name).to.equal('handleSwapEthTokens')
    const action = await actionFunc(job)

    expect(action.name).to.equal('swapTokens')
    expect(action.tokenAddress).to.deep.equal([
      '0x249be57637d8b013ad64785404b24aebae9b098b',
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    ])
    expect(action.tokensIn).to.deep.equal([
      {
        tokenAddress: '0x249be57637d8b013ad64785404b24aebae9b098b',
        amount: '83259068926050968'
      }
    ])
    console.log({ action })
  })
})
