import {action, createRequestTypes} from './utils'

export const NAME = createRequestTypes('NAME')
export const SYMBOL = createRequestTypes('SYMBOL')
export const TOTAL_SUPPLY = createRequestTypes('TOTAL_SUPPLY')
export const TOKEN_URI = createRequestTypes('TOKEN_URI')
export const SET_TOKEN_URI = createRequestTypes('SET_TOKEN_URI')
export const OWNER = createRequestTypes('OWNER')

export const BALANCE_OF = createRequestTypes('BALANCE_OF')
export const TRANSFER = createRequestTypes('TRANSFER')

export const FETCH_CONTRACT_DATA = createRequestTypes('FETCH_CONTRACT_DATA')

export const name = (contractAddress) => action(NAME.REQUEST, {contractAddress})
export const symbol = (contractAddress) => action(SYMBOL.REQUEST, {contractAddress})
export const totalSupply = (contractAddress) => action(TOTAL_SUPPLY.REQUEST, {contractAddress})
export const tokenURI = (contractAddress) => action(TOKEN_URI.REQUEST, {contractAddress})
export const setTokenURI = (contractAddress, tokenURI) => action(SET_TOKEN_URI.REQUEST, {contractAddress, tokenURI})
export const owner = (contractAddress) => action(OWNER.REQUEST, {contractAddress})

export const balanceOf = (contractAddress, address) => action(BALANCE_OF.REQUEST, {contractAddress, address})
export const transfer = (contractAddress, to, value) => action(TRANSFER.REQUEST, {contractAddress, to, value})

export const fetchContractData = (contractAddress) => action(FETCH_CONTRACT_DATA.REQUEST, {contractAddress})
