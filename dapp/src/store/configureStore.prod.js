import { createStore, applyMiddleware } from 'redux'
import * as Sentry from '@sentry/browser'
import createSagaMiddleware, { END } from 'redux-saga'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
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
    persistReducer({
      key: 'root',
      storage,
      stateReconciler: initialState,
      whitelist: ['user']
    },
    createRootReducer(history)),
    applyMiddleware(
      reduxCatch(errorHandler),
      routerMiddleware(history),
      postponeMiddleware,
      sagaMiddleware
    )
  )

  store.runSaga = sagaMiddleware.run
  store.close = () => store.dispatch(END)
  const persistor = persistStore(store)
  return { store, history, persistor }
}
