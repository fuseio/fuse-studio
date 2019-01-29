import {createRequestTypes, createEntityAction} from './utils'

export const entityName = 'partners'
const partnerAction = createEntityAction(entityName)

export const FETCH_PARTNERS = createRequestTypes('FETCH_PARTNERS')

export const fetchPartners = (page) => partnerAction(FETCH_PARTNERS.REQUEST, {page})
