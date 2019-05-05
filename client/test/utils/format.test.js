import { assert } from 'chai'
import { nameToSymbol } from 'utils/format'

describe('nameToSymbol', () => {
  it('should return BIT for bitcoin', () => {
    assert.equal(nameToSymbol('bitcoin'), 'BIT')
  })

  it('should return ETC for ethereum classis', () => {
    assert.equal(nameToSymbol('Ethereum classic'), 'ETC')
  })

  it('should return CLN for Colu Local Network', () => {
    assert.equal(nameToSymbol('Colu Local Network'), 'CLN')
  })

  it('should return BDPN for Bitcoin Diamond Private Network', () => {
    assert.equal(nameToSymbol('Bitcoin Diamond Private Network'), 'BDPN')
  })

  it('should return VVVL for Very Very Very Long Name', () => {
    assert.equal(nameToSymbol('Very Very Very Long Name'), 'VVVL')
  })

  it('should return A for A (short name)', () => {
    assert.equal(nameToSymbol('A'), 'A')
  })

  it('should return 1BT for 1 Blood Token', () => {
    assert.equal(nameToSymbol('1 Blood Token'), '1BT')
  })
})
