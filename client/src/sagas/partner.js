import { all } from 'redux-saga/effects'

import {tryTakeEvery, createEntitiesFetch} from './utils'
import * as actions from 'actions/partner'
import * as api from 'services/api/partner'

const fetchPartners = createEntitiesFetch(actions.FETCH_PARTNERS, api.fetchPartners)

export default function * partnerSaga () {
  yield all([
    tryTakeEvery(actions.FETCH_PARTNERS, fetchPartners, 1)
  ])
}
