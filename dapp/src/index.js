import 'babel-polyfill'
import 'utils/validation/yup'

import React from 'react'
import ReactDOM from 'react-dom'
import * as Sentry from '@sentry/browser'

import Root from 'containers/Root'
import configureStore from 'store/configureStore'
import rootSaga from 'sagas/index'

Sentry.init({ dsn: `https://${CONFIG.sentry.key}@sentry.io/${CONFIG.sentry.project}` })

const { store, history } = configureStore(window.__INITIAL_STATE__)

store.runSaga(rootSaga)

ReactDOM.render(<Root
  store={store} history={history} />,
document.getElementById('root'))
