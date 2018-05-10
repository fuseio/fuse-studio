import 'babel-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'

import Root from 'containers/Root'
import configureStore from 'store/configureStore'
import rootSaga from 'sagas/index'

const store = configureStore(window.__INITIAL_STATE__)

store.runSaga(rootSaga)

ReactDOM.render(<Root
  store={store} />,
document.getElementById('root'))
