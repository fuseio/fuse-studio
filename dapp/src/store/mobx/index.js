import React from 'react'
import Dashboard from './state/dashboard'
import Price from './state/price'
import Network from './state/network'
import { MobXProviderContext } from 'mobx-react'
import { configure } from 'mobx'

configure({
  observableRequiresReaction: true,
  enforceActions: 'always'
})
export class Store {
  constructor () {
    this.dashboard = new Dashboard(this)
    this.network = new Network(this)
    this.price = new Price(this)
  }
}

export default new Store()

export const useStore = () => {
  const store = React.useContext(MobXProviderContext)
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider')
  }
  return store
}

export const withStore = (Component) => (props) => {
  return <Component {...props} store={useStore()} />
}
