import { createStore, applyMiddleware } from 'redux'
import * as Sentry from '@sentry/browser'
import createSagaMiddleware, { END } from 'redux-saga'
import { createBrowserHistory } from 'history'
import reduxCatch from 'redux-catch'
import { postponeMiddleware } from '../middleware/postpone'
import { routerMiddleware } from 'connected-react-router'

import createRootReducer from '../reducers'

function errorHandler (error) {
  Sentry.captureException(error)
  throw error
}

export default function configureStore (initialState) {
  const history = createBrowserHistory()
  const sagaMiddleware = createSagaMiddleware({
    onError: (error, sec) => {
      Sentry.captureException(error)
    }
  })

  const store = createStore(
    createRootReducer(history),
    initialState,
    applyMiddleware(
      reduxCatch(errorHandler),
      routerMiddleware(history),
      postponeMiddleware,
      sagaMiddleware
    )
  )

  store.runSaga = sagaMiddleware.run
  store.close = () => store.dispatch(END)
  return { store, history }
}
