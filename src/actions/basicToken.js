import {action, createRequestTypes} from './index'

export const NAME = createRequestTypes('NAME')
export const SYMBOL = createRequestTypes('SYMBOL')
export const TOTAL_SUPPLY = createRequestTypes('TOTAL_SUPPLY')
export const METADATA = createRequestTypes('METADATA')
export const SET_METADATA = createRequestTypes('SET_METADATA')
export const OWNER = createRequestTypes('OWNER')

export const BALANCE_OF = createRequestTypes('BALANCE_OF')
export const TRANSFER = createRequestTypes('TRANSFER')

export const FETCH_CONTRACT_DATA = createRequestTypes('FETCH_CONTRACT_DATA')

export const name = (contractAddress) => action(NAME.REQUEST, {contractAddress})
export const symbol = (contractAddress) => action(SYMBOL.REQUEST, {contractAddress})
export const totalSupply = (contractAddress) => action(TOTAL_SUPPLY.REQUEST, {contractAddress})
export const metadata = (contractAddress) => action(METADATA.REQUEST, {contractAddress})
export const setMetadata = (contractAddress, metadataUri) => action(SET_METADATA.REQUEST, {contractAddress, metadataUri})
export const owner = (contractAddress) => action(OWNER.REQUEST, {contractAddress})

export const balanceOf = (contractAddress, address) => action(BALANCE_OF.REQUEST, {contractAddress, address})
export const transfer = (contractAddress, to, value) => action(TRANSFER.REQUEST, {contractAddress, to, value})

export const fetchContractData = (contractAddress) => action(FETCH_CONTRACT_DATA.REQUEST, {contractAddress})
