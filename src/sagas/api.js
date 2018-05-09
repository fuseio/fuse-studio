import { all, call, put, take, fork } from 'redux-saga/effects'

import * as api from 'services/api'
import * as actions from 'actions/api'

export function * addCommunity (community) {
  try {
    yield call(api.addCommunity, community)
    yield put({type: actions.ADD_COMMUNITY.SUCCESS,
      response: {
        community
      }})
  } catch (error) {
    yield put({type: actions.ADD_COMMUNITY.FAILURE, error})
  }
}

export function * watchAddCommunity () {
  while (true) {
    const {community} = yield take(actions.ADD_COMMUNITY.REQUEST)
    yield fork(addCommunity, community)
  }
}

export default function * rootSaga () {
  yield all([
    fork(watchAddCommunity)
  ])
}
