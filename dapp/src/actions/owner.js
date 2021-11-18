import { createRequestTypes, requestAction } from './utils'

export const OWNERSHIP = createRequestTypes('OWNERSHIP')
export const isOwner = (communityAddress, account) => requestAction(OWNERSHIP, { communityAddress, account })
export const setDefault = () => requestAction('DEFAULT')