import 'babel-polyfill'
import 'utils/validation/yup'

import React from 'react'
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

import { LangContext, LangProvider } from './components/common/Language/lang_provider';
import { IntlProvider } from 'react-intl';
import en from '../lang/en.json';
import zh from '../lang/zh.json';
import vi from '../lang/vi.json';
import ko from '../lang/ko.json';

Sentry.init({ dsn: `https://${CONFIG.sentry.key}@sentry.io/${CONFIG.sentry.project}` })

const { store, history } = configureStore(window.__INITIAL_STATE__)

store.runSaga(rootSaga)

const MESSAGES = {
  en,
  zh,
  vi,
  ko
};

ReactDOM.render(
  <LangProvider>
    <LangContext.Consumer>
      {(lang) => (
        <IntlProvider
          messages={MESSAGES[lang]}
          locale={lang}
          defaultLocale='en'
        >
          <Provider store={store}>
            <ApolloProvider client={client}>
              <ConnectedRouter history={history}>
                <ScrollToTopController>
                  <ErrorBoundary>
                    <Root />
                  </ErrorBoundary>
                </ScrollToTopController>
              </ConnectedRouter>
            </ApolloProvider>
          </Provider>
        </IntlProvider>
      )}
    </LangContext.Consumer>
  </LangProvider>,
  document.getElementById('root'))
