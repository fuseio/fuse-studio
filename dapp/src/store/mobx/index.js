import React from 'react'
import isEqual from 'lodash/isEqual'
import Dashboard from './state/dashboard'
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

export function Provider ({ children, ...propsValue }) {
  const contextValue = React.useContext(MobXProviderContext)
  const [value] = React.useState(() => ({
    ...contextValue,
    ...propsValue
  }))

  if (process.env.NODE_ENV !== 'production') {
    const newValue = { ...value, ...propsValue }
    if (!isEqual(value, newValue)) {
      throw new Error(
        'MobX Provider: The set of provided stores has changed. Please avoid changing stores as the change might not propagate to all children'
      )
    }
  }

  return (
    <MobXProviderContext.Provider value={value}>{children}</MobXProviderContext.Provider>
  )
}
