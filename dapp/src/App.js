import { hot } from 'react-hot-loader'
import React, { StrictMode } from 'react'
import Modal from 'react-modal'
import { ModalProvider } from 'react-modal-hook'
import { PersistGate } from 'redux-persist/integration/react'
import { TransitionGroup } from 'react-transition-group'
import { Provider } from 'react-redux'
import * as Sentry from '@sentry/browser'
import { ConnectedRouter } from 'connected-react-router'

import ErrorBoundary from 'components/common/ErrorBoundary'
import ScrollToTopController from 'containers/ScrollToTopController'
import Root from 'containers/Root'
import configureStore from 'store/configureStore'
import rootSaga from 'sagas/index'
import mobxStore from 'store/mobx'
import { Provider as MobxProvider } from 'mobx-react'

Sentry.init({ dsn: `https://${CONFIG.sentry.key}@sentry.io/${CONFIG.sentry.project}` })

const { store, history, persistor } = configureStore(window.__INITIAL_STATE__)

store.runSaga(rootSaga)

Modal.setAppElement('#root')

const App = () => (
  <StrictMode>
    <ModalProvider rootComponent={TransitionGroup}>
      <Provider store={store}>
        <MobxProvider {...mobxStore}>
          <PersistGate loading={null} persistor={persistor}>
            <ConnectedRouter history={history}>
              <ScrollToTopController>
                <ErrorBoundary>
                  <Root />
                </ErrorBoundary>
              </ScrollToTopController>
            </ConnectedRouter>
          </PersistGate>
        </MobxProvider>
      </Provider>
    </ModalProvider>
  </StrictMode>
)

export default hot(module)(App)
