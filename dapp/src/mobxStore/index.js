import React from 'react'
import Dashboard from './state/dashboard'
// import Dashboard, { PluginItem } from './state/dashboard_test'
import Network from './state/network'
import { MobXProviderContext } from 'mobx-react'
// import { types, Instance, onSnapshot } from 'mobx-state-tree'
import { configure } from 'mobx'

configure({
  observableRequiresReaction: true
})

// const RootModel = types.model({
//   dashboard: types.optional(Dashboard, {}),
//   // network: Network
// })

// export const rootStore = RootModel.create({
//   dashboard: Dashboard.create({
//     isFetching: false,
//     isAdmin: false,
//     plugins: {
//       businessList: PluginItem.create({ isActive: false, name: 'businessList', isRemoved: false }),
//       bonuses: PluginItem.create({ isActive: false, name: 'bonuses', isRemoved: false }),
//       joinBonus: PluginItem.create({ isActive: false, name: 'joinBonus', isRemoved: false }),
//       inviteBonus: PluginItem.create({ isActive: false, name: 'inviteBonus', isRemoved: false }),
//       backupBonus: PluginItem.create({ isActive: false, name: 'backupBonus', isRemoved: false }),
//       walletBanner: PluginItem.create({ isActive: false, name: 'walletBanner', isRemoved: false }),
//       onramp: PluginItem.create({ isActive: false, name: 'onramp', services: {}, isRemoved: false }),
//     }
//   })
// })

// export default rootStore

// onSnapshot(rootStore, snapshot => {
//   console.log({ snapshot })
//   window.localStorage.setItem('rootState', JSON.stringify(snapshot))
// })

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
