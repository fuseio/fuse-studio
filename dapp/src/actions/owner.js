import { createRequestTypes, requestAction } from './utils'


export const OWNERSHIP = createRequestTypes('OWNERSHIP')
export const isOwner = (accountAddress, communityAddress) => requestAction(OWNERSHIP, { accountAddress, communityAddress })
export const isOwner = () => requestAction('DEFAULT')

