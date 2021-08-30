
require('module-alias/register')
const { expect } = require('chai')
const { Signatures, JobParser } = require('@utils/abi')
const { signatures } = require('@services/abu/wallet')
const TransferManagerABI = require('@constants/abi/TransferManager')
const CommunityManagerABI = require('@constants/abi/CommunityManager')

describe('Signatures', () => {
  it('addContract should parse the contract ABI', () => {
    const sigs = new Signatures()
    sigs.addContract('TransferManager', TransferManagerABI)
    expect(sigs.getFragment('0x2df546f4').name).to.equal('transferToken')
    expect(sigs.getFragment('0x2df546f4').contractName).to.equal('TransferManager')

    expect(sigs.getFragment('0x09d22c8e').name).to.equal('approveTokenAndCallContract')
    expect(sigs.getFragment('0x09d22c8e').contractName).to.equal('TransferManager')

    sigs.addContract('CommunityManager', CommunityManagerABI)
  })
})

describe.only('JobParser', () => {
  it('Should parse arguements for tokenTransfer', () => {
    const p = new JobParser(signatures)
    const methodData = '0x2df546f4000000000000000000000000af21fb07aed5f2fcb2664b67f1f9a9de5faf4de0000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000057520b81f4045f883fd0a16353adfa1480c86c2800000000000000000000000000000000000000000000000fb88ef7839f48000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000'
    console.log(p.parse({ methodData }))
  })
})
