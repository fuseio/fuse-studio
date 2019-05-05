import 'babel-polyfill'
import 'utils/validation/yup'

import React from 'react'
import ReactDOM from 'react-dom'

import Root from 'containers/Root'
import configureStore from 'store/configureStore'
import rootSaga from 'sagas/index'

const { store, history } = configureStore(window.__INITIAL_STATE__)

store.runSaga(rootSaga)

ReactDOM.render(<Root
  store={store} history={history} />,
document.getElementById('root'))
