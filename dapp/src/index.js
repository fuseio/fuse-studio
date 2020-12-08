import 'babel-polyfill'
import 'utils/validation/yup'

import React from 'react'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/client'
import * as Sentry from '@sentry/browser'
import { ConnectedRouter } from 'connected-react-router'

import ErrorBoundary from 'components/common/ErrorBoundary'
import ScrollToTopController from 'containers/ScrollToTopController'
import Root from 'containers/Root'
import configureStore from 'store/configureStore'
import rootSaga from 'sagas/index'
import { client } from 'services/graphql'

Sentry.init({ dsn: `https://${CONFIG.sentry.key}@sentry.io/${CONFIG.sentry.project}` })

const { store, history, persistor } = configureStore(window.__INITIAL_STATE__)

store.runSaga(rootSaga)

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ApolloProvider client={client}>
        <ConnectedRouter history={history}>
          <ScrollToTopController>
            <ErrorBoundary>
              <Root />
            </ErrorBoundary>
          </ScrollToTopController>
        </ConnectedRouter>
      </ApolloProvider>
    </PersistGate>
  </Provider>,
  document.getElementById('root'))
