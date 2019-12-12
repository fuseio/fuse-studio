import 'babel-polyfill'
import 'utils/validation/yup'

import React from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import ApolloClient from 'apollo-boost'
import * as Sentry from '@sentry/browser'
import { ConnectedRouter } from 'connected-react-router'

import ErrorBoundary from 'components/common/ErrorBoundary'
import ScrollToTopController from 'containers/ScrollToTopController'
import { Web3ProvideAuth } from 'hooks/useWeb3Auth'
import Root from 'containers/Root'
import configureStore from 'store/configureStore'
import rootSaga from 'sagas/index'

Sentry.init({ dsn: `https://${CONFIG.sentry.key}@sentry.io/${CONFIG.sentry.project}` })

const { store, history } = configureStore(window.__INITIAL_STATE__)

store.runSaga(rootSaga)

const client = new ApolloClient({ uri: CONFIG.api.graph.url })

ReactDOM.render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <ConnectedRouter history={history}>
        <ScrollToTopController>
          <ErrorBoundary>
            <Web3ProvideAuth>
              <Root />
            </Web3ProvideAuth>
          </ErrorBoundary>
        </ScrollToTopController>
      </ConnectedRouter>
    </ApolloProvider>
  </Provider>,
  document.getElementById('root'))
