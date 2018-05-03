import { put } from 'redux-saga/effects'

export const createEntityPut = (entity) => (action) => put({...action, entity})
