const { expect } = require('chai')
const { SignatureStore, MethodParser } = require('@utils/abi')
const signatureStore = require('@services/wallet/signatureStore')
const TransferManagerABI = require('@constants/abi/TransferManager')
const CommunityManagerABI = require('@constants/abi/CommunityManager')
const { inspect } = require('util')

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
  it('Should parse arguments for transferToken', () => {
    const p = new MethodParser(signatureStore)
    const methodData = '0x2df546f4000000000000000000000000af21fb07aed5f2fcb2664b67f1f9a9de5faf4de0000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000057520b81f4045f883fd0a16353adfa1480c86c2800000000000000000000000000000000000000000000000fb88ef7839f48000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000'
    const { params, contractName, methodName } = p.parse(methodData)
    expect(contractName).to.equal('TransferManager')
    expect(methodName).to.equal('transferToken')
    expect(params._wallet).to.equal('0xAF21fb07AEd5F2fCB2664b67F1F9A9dE5FaF4DE0')
    expect(params._token).to.equal('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    expect(params._amount).to.equal('290000000000000000000')
  })
  describe('#approveTokenAndCallContract', () => {
    it('Should parse arguments for swapExactTokensForTokens', () => {
      const p = new MethodParser(signatureStore)
      const methodData = '0x09d22c8e000000000000000000000000e05e8cb522868ae468738d4a835b3de2ac1befc0000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b000000000000000000000000fb76e9e7d88e308ab530330ed90e84a95257031900000000000000000000000000000000000000000000000821ab0d441498000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000012438ed173900000000000000000000000000000000000000000000000821ab0d441498000000000000000000000000000000000000000000000000000000adba2c5806b13300000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000e05e8cb522868ae468738d4a835b3de2ac1befc000000000000000000000000000000000000000000000000000000000611cb69b0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b0000000000000000000000000be9e53fd7edac9f859882afdda116645287c629000000000000000000000000a722c13135930332eb3d749b2f0906559d2c5b9900000000000000000000000000000000000000000000000000000000'
      const data = '0x38ed173900000000000000000000000000000000000000000000000821ab0d441498000000000000000000000000000000000000000000000000000000adba2c5806b13300000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000e05e8cb522868ae468738d4a835b3de2ac1befc000000000000000000000000000000000000000000000000000000000611cb69b0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b0000000000000000000000000be9e53fd7edac9f859882afdda116645287c629000000000000000000000000a722c13135930332eb3d749b2f0906559d2c5b99'
      const { params, contractName, methodName } = p.parse(methodData)
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

  describe('#callContract', () => {
    it('Should parse arguments for swapExactETHForTokens', () => {
      const p = new MethodParser(signatureStore)
      const methodData = '0xfd6ac3090000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd6000000000000000000000000fb76e9e7d88e308ab530330ed90e84a9525703190000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e47ff36ab50000000000000000000000000000000000000000000000000127cbae9baac29800000000000000000000000000000000000000000000000000000000000000800000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd6000000000000000000000000000000000000000000000000000000006133be7900000000000000000000000000000000000000000000000000000000000000020000000000000000000000000be9e53fd7edac9f859882afdda116645287c629000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b00000000000000000000000000000000000000000000000000000000'
      const data = '0x7ff36ab50000000000000000000000000000000000000000000000000127cbae9baac29800000000000000000000000000000000000000000000000000000000000000800000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd6000000000000000000000000000000000000000000000000000000006133be7900000000000000000000000000000000000000000000000000000000000000020000000000000000000000000be9e53fd7edac9f859882afdda116645287c629000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b'
      const { params, contractName, methodName } = p.parse(methodData)
      // console.log({ params, contractName, methodName })
      expect(contractName).to.equal('TransferManager')
      expect(methodName).to.equal('callContract')
      expect(params._wallet).to.equal('0x6BA3b80490A4C69e9c5b53daC49249F953FA4dD6')
      expect(params._contract).to.equal('0xFB76e9E7d88E308aB530330eD90e84a952570319')
      expect(params._value).to.equal('1000000000000000000')
      expect(params._data).to.equal(data)

      function checkInner (methodData) {
        const { params, contractName, methodName } = p.parse(methodData)
        // console.log({ params })
        expect(contractName).to.equal('FuseswapRouter')
        expect(methodName).to.equal('swapExactETHForTokens')
        expect(params.amountOutMin).to.equal('83259068926050968')
        expect(params.path).to.deep.equal([
          '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
          '0x249BE57637D8B013Ad64785404b24aeBaE9B098B'
        ])
        expect(params.to).to.equal('0x6BA3b80490A4C69e9c5b53daC49249F953FA4dD6')
        expect(params.deadline).to.equal('1630781049')
        console.log(inspect(p.parse(methodData)))
      }
      console.log(inspect(p.parse(methodData)))
      checkInner(params._data)
    })

    it('Should parse arguments for addLiquidity', () => {
      const p = new MethodParser(signatureStore)
      const methodData = '0xfd6ac3090000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd6000000000000000000000000fb76e9e7d88e308ab530330ed90e84a952570319000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000104e8e33700000000000000000000000000a722c13135930332eb3d749b2f0906559d2c5b99000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b0000000000000000000000000000000000000000000000000000006d94d84fa500000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000000006d0894ab68000000000000000000000000000000000000000000000000000388f27d8d30000000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd6000000000000000000000000000000000000000000000000000000006133768000000000000000000000000000000000000000000000000000000000'
      const data = '0xe8e33700000000000000000000000000a722c13135930332eb3d749b2f0906559d2c5b99000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b0000000000000000000000000000000000000000000000000000006d94d84fa500000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000000006d0894ab68000000000000000000000000000000000000000000000000000388f27d8d30000000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd60000000000000000000000000000000000000000000000000000000061337680'
      const { params, contractName, methodName } = p.parse(methodData)
      console.log({ params, contractName, methodName })
      expect(contractName).to.equal('TransferManager')
      expect(methodName).to.equal('callContract')
      expect(params._wallet).to.equal('0x6BA3b80490A4C69e9c5b53daC49249F953FA4dD6')
      expect(params._contract).to.equal('0xFB76e9E7d88E308aB530330eD90e84a952570319')
      expect(params._value).to.equal('0')
      expect(params._data).to.equal(data)

      function checkInner (methodData) {
        const { params, contractName, methodName } = p.parse(methodData)
        console.log({ params })
        expect(contractName).to.equal('FuseswapRouter')
        expect(methodName).to.equal('addLiquidity')
        expect(params.tokenA).to.equal('0xa722c13135930332Eb3d749B2F0906559D2C5b99')
        expect(params.tokenB).to.equal('0x249BE57637D8B013Ad64785404b24aeBaE9B098B')
        expect(params.amountADesired).to.equal('470648639397')
        expect(params.amountBDesired).to.equal('1000000000000000')
        expect(params.amountAMin).to.equal('468295396200')
        expect(params.amountBMin).to.equal('995000000000000')
        expect(params.to).to.equal('0x6BA3b80490A4C69e9c5b53daC49249F953FA4dD6')
        expect(params.deadline).to.equal('1630762624')
      }
      checkInner(params._data)
    })

    it('Should parse arguments for addLiquidityEth', () => {
      const p = new MethodParser(signatureStore)
      const methodData = '0xfd6ac3090000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd6000000000000000000000000fb76e9e7d88e308ab530330ed90e84a9525703190000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c4f305d719000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b000000000000000000000000000000000000000000000000012993bbcb435112000000000000000000000000000000000000000000000000012816d5bc2aa8fc0000000000000000000000000000000000000000000000000dcef33a6f8380000000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd60000000000000000000000000000000000000000000000000000000061337bad00000000000000000000000000000000000000000000000000000000'
      const data = '0xf305d719000000000000000000000000249be57637d8b013ad64785404b24aebae9b098b000000000000000000000000000000000000000000000000012993bbcb435112000000000000000000000000000000000000000000000000012816d5bc2aa8fc0000000000000000000000000000000000000000000000000dcef33a6f8380000000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd60000000000000000000000000000000000000000000000000000000061337bad'
      const { params, contractName, methodName } = p.parse(methodData)
      // console.log({ params, contractName, methodName })
      expect(contractName).to.equal('TransferManager')
      expect(methodName).to.equal('callContract')
      expect(params._wallet).to.equal('0x6BA3b80490A4C69e9c5b53daC49249F953FA4dD6')
      expect(params._contract).to.equal('0xFB76e9E7d88E308aB530330eD90e84a952570319')
      expect(params._value).to.equal('1000000000000000000')
      expect(params._data).to.equal(data)

      function checkInner (methodData) {
        const { params, contractName, methodName } = p.parse(methodData)
        // console.log({ params })
        expect(contractName).to.equal('FuseswapRouter')
        expect(methodName).to.equal('addLiquidityETH')
        expect(params.token).to.equal('0x249BE57637D8B013Ad64785404b24aeBaE9B098B')
        expect(params.amountTokenDesired).to.equal('83760502861418770')
        expect(params.amountTokenMin).to.equal('83341700347111676')
        expect(params.amountETHMin).to.equal('995000000000000000')
        expect(params.to).to.equal('0x6BA3b80490A4C69e9c5b53daC49249F953FA4dD6')
        expect(params.deadline).to.equal('1630763949')
      }
      checkInner(params._data)
    })

    describe('#MultiRewards', () => {
      it('Should parse arguments for stake', () => {
        const p = new MethodParser(signatureStore)
        const methodData = '0xfd6ac3090000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd6000000000000000000000000076bdea1fd4695bdef9ba4579463bc4b3c97d645000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000024a694fc3a00000000000000000000000000000000000000000000000009d2a263e6c9eed800000000000000000000000000000000000000000000000000000000'
        const data = '0xa694fc3a00000000000000000000000000000000000000000000000009d2a263e6c9eed8'
        const { params, contractName, methodName } = p.parse(methodData)
        console.log({ params, contractName, methodName })
        expect(contractName).to.equal('TransferManager')
        expect(methodName).to.equal('callContract')
        expect(params._wallet).to.equal('0x6BA3b80490A4C69e9c5b53daC49249F953FA4dD6')
        expect(params._contract).to.equal('0x076BDeA1fD4695BDEF9Ba4579463BC4B3C97d645')
        expect(params._value).to.equal('0')
        expect(params._data).to.equal(data)

        function checkInner (methodData) {
          const { params, contractName, methodName } = p.parse(methodData)
          console.log({ params })
          expect(contractName).to.equal('MultiRewardProgram')
          expect(methodName).to.equal('stake')
          expect(params.amount).to.equal('707806641408044760')
        }
        console.log(inspect(p.parse(methodData)))
        checkInner(params._data)
      })
    })
  })
})

// approve (callContract)
// 0xfd6ac3090000000000000000000000006ba3b80490a4c69e9c5b53dac49249f953fa4dd6000000000000000000000000a722c13135930332eb3d749b2f0906559d2c5b99000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000fb76e9e7d88e308ab530330ed90e84a952570319ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000