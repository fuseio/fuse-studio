import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware, { END } from 'redux-saga'
import createHistory from 'history/createBrowserHistory'
import { routerMiddleware } from 'react-router-redux'

import rootReducer from '../reducers'

const history = createHistory()

export default function configureStore (initialState) {
  const sagaMiddleware = createSagaMiddleware()
  const routerMd = routerMiddleware(history)

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(
      routerMd,
      sagaMiddleware
    )
  )

  store.runSaga = sagaMiddleware.run
  store.close = () => store.dispatch(END)
  return store
}
