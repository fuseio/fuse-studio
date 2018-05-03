import { put } from 'redux-saga/effects'

export const createEnitityPut = (entity) => (action) => put({...action, entity})
