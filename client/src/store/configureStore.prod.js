import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware, { END } from 'redux-saga'
import createHistory from 'history/createBrowserHistory'
import { routerMiddleware } from 'connected-react-router'

import createRootReducer from '../reducers'

export default function configureStore (initialState) {
  const history = createHistory()
  const sagaMiddleware = createSagaMiddleware()

  const store = createStore(
    createRootReducer(history),
    initialState,
    applyMiddleware(
      routerMiddleware(history),
      sagaMiddleware
    )
  )

  store.runSaga = sagaMiddleware.run
  store.close = () => store.dispatch(END)
  return {store, history}
}
