import utils from 'web3-utils'

export const TRANSFER_EVENT = utils.soliditySha3('Transfer(address,address,uint256)')

export const CHANGE_EVENT = utils.soliditySha3('Change(address,uint256,address,uint256,address)')
