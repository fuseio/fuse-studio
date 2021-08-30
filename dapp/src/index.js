import '@babel/polyfill'
import 'utils/validation/yup'
import { isMobile } from 'react-device-detect'
import ReactGA from 'react-ga4'
import React from 'react'
import { render } from 'react-dom'
import App from './App'

if (typeof CONFIG?.reactGA?.trackingId === 'string') {
  ReactGA.initialize(CONFIG?.reactGA?.trackingId, CONFIG.reactGA.gaOptions)
  ReactGA.set({
    customBrowserType: !isMobile ? 'desktop' : 'web3' in window || 'ethereum' in window ? 'mobileWeb3' : 'mobileRegular'
  })
} else {
  ReactGA.initialize('test', { testMode: true, debug: true })
}

window.addEventListener('error', error => {
  ReactGA.exception({
    description: `${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`,
    fatal: true
  })
})

render(<App />, document.getElementById('root'))
