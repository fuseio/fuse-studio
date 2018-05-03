import {createRequestTypes, createEntityAction} from './utils'

const entity = 'basicToken'

const basicTokenAction = createEntityAction(entity)

export const NAME = createRequestTypes('NAME')
export const SYMBOL = createRequestTypes('SYMBOL')
export const TOTAL_SUPPLY = createRequestTypes('TOTAL_SUPPLY')
export const TOKEN_URI = createRequestTypes('TOKEN_URI')
export const SET_TOKEN_URI = createRequestTypes('SET_TOKEN_URI')
export const OWNER = createRequestTypes('OWNER')

export const BALANCE_OF = createRequestTypes('BALANCE_OF')
export const TRANSFER = createRequestTypes('TRANSFER')
export const APPROVE = createRequestTypes('APPROVE')

export const FETCH_CONTRACT_DATA = createRequestTypes('FETCH_CONTRACT_DATA')

export const name = (contractAddress) => basicTokenAction(NAME.REQUEST, {contractAddress})
export const symbol = (contractAddress) => basicTokenAction(SYMBOL.REQUEST, {contractAddress})
export const totalSupply = (contractAddress) => basicTokenAction(TOTAL_SUPPLY.REQUEST, {contractAddress})
export const tokenURI = (contractAddress) => basicTokenAction(TOKEN_URI.REQUEST, {contractAddress})
export const setTokenURI = (contractAddress, tokenURI) => basicTokenAction(SET_TOKEN_URI.REQUEST, {contractAddress, tokenURI})
export const owner = (contractAddress) => basicTokenAction(OWNER.REQUEST, {contractAddress})

export const balanceOf = (contractAddress, address) => basicTokenAction(BALANCE_OF.REQUEST, {contractAddress, address})
export const transfer = (contractAddress, to, value) => basicTokenAction(TRANSFER.REQUEST, {contractAddress, to, value})
export const approve = (contractAddress, spender, value) => basicTokenAction(APPROVE.REQUEST, {contractAddress, spender, value})

export const fetchContractData = (contractAddress) => basicTokenAction(FETCH_CONTRACT_DATA.REQUEST, {contractAddress})
