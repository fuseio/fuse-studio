
require('module-alias/register')
const { expect } = require('chai')
const { SignatureStore, MethodParser } = require('@utils/abi')
const { signatureStore } = require('@services/abi/wallet')
const TransferManagerABI = require('@constants/abi/TransferManager')
const CommunityManagerABI = require('@constants/abi/CommunityManager')

describe('SignatureStore', () => {
  it('addContract should parse the contract ABI', () => {
    const sigs = new SignatureStore()
    sigs.addContract('TransferManager', TransferManagerABI)
    expect(sigs.getFragment('0x2df546f4').name).to.equal('transferToken')
    expect(sigs.getFragment('0x2df546f4').contractName).to.equal('TransferManager')

    expect(sigs.getFragment('0x09d22c8e').name).to.equal('approveTokenAndCallContract')
    expect(sigs.getFragment('0x09d22c8e').contractName).to.equal('TransferManager')

    sigs.addContract('CommunityManager', CommunityManagerABI)
  })
})

describe('MethodParser', () => {
  it('Should parse arguements for transferToken', () => {
    const p = new MethodParser(signatureStore)
    const methodData = '0x2df546f4000000000000000000000000af21fb07aed5f2fcb2664b67f1f9a9de5faf4de0000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000057520b81f4045f883fd0a16353adfa1480c86c2800000000000000000000000000000000000000000000000fb88ef7839f48000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000'
    const { params, contractName, methodName } = p.parse(methodData)
    expect(contractName).to.equal('TransferManager')
    expect(methodName).to.equal('transferToken')
    expect(params._wallet).to.equal('0xAF21fb07AEd5F2fCB2664b67F1F9A9dE5FaF4DE0')
    expect(params._token).to.equal('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    expect(params._amount).to.equal('290000000000000000000')
  })

  it('Should parse arguements for approveTokenAndCallContract', () => {
    const p = new MethodParser(signatureStore)
    const methodData = '0x09d22c8e000000000000000000000000e05e8cb522868ae468738d4a835b3de2ac1befc0000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b000000000000000000000000fb76e9e7d88e308ab530330ed90e84a95257031900000000000000000000000000000000000000000000000821ab0d441498000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000012438ed173900000000000000000000000000000000000000000000000821ab0d441498000000000000000000000000000000000000000000000000000000adba2c5806b13300000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000e05e8cb522868ae468738d4a835b3de2ac1befc000000000000000000000000000000000000000000000000000000000611cb69b0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b0000000000000000000000000be9e53fd7edac9f859882afdda116645287c629000000000000000000000000a722c13135930332eb3d749b2f0906559d2c5b9900000000000000000000000000000000000000000000000000000000'
    const data = '0x38ed173900000000000000000000000000000000000000000000000821ab0d441498000000000000000000000000000000000000000000000000000000adba2c5806b13300000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000e05e8cb522868ae468738d4a835b3de2ac1befc000000000000000000000000000000000000000000000000000000000611cb69b0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b0000000000000000000000000be9e53fd7edac9f859882afdda116645287c629000000000000000000000000a722c13135930332eb3d749b2f0906559d2c5b99'
    const { params, contractName, methodName } = p.parse(methodData)
    // console.log(parsed)
    expect(contractName).to.equal('TransferManager')
    expect(methodName).to.equal('approveTokenAndCallContract')
    expect(params._wallet).to.equal('0xE05E8cB522868ae468738D4a835B3dE2ac1Befc0')
    expect(params._token).to.equal('0x249BE57637D8B013Ad64785404b24aeBaE9B098B')
    expect(params._contract).to.equal('0xFB76e9E7d88E308aB530330eD90e84a952570319')
    expect(params._amount).to.equal('150000000000000000000')
    expect(params._data).to.equal(data)

    function checkInner (methodData) {
      const { params, contractName, methodName } = p.parse(methodData)
      console.log({ params })
      expect(contractName).to.equal('FuseswapRouter')
      expect(methodName).to.equal('swapExactTokensForTokens')
      expect(params.amountIn).to.equal('150000000000000000000')
      expect(params.amountOutMin).to.equal('48899870589104435')
      expect(params.path).to.deep.equal([
        '0x249BE57637D8B013Ad64785404b24aeBaE9B098B',
        '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
        '0xa722c13135930332Eb3d749B2F0906559D2C5b99'
      ])
      expect(params.to).to.equal('0xE05E8cB522868ae468738D4a835B3dE2ac1Befc0')
      expect(params.deadline).to.equal('1629271707')
    }
    checkInner(params._data)
  })
})
