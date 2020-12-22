import {
  types,
  Instance,
  SnapshotIn,
  getParent,
  destroy,
  flow
} from 'mobx-state-tree'
import request from 'superagent'
import get from 'lodash/get'
import omit from 'lodash/omit'
import forEach from 'lodash/forEach'
import keyBy from 'lodash/keyBy'
import has from 'lodash/has'
import { getCommunityAdmins } from 'services/graphql/community'

export const ServicePlugin = types.model({
  isActive: types.optional(types.boolean),
  name: types.optional(types.string)
})

export const PluginItem = types
  .model({
    isActive: types.optional(types.boolean),
    name: types.string,
    isRemoved: types.optional(types.boolean),
    services: types.optional(types.map(ServicePlugin), {})
  })
  .actions(self => ({
    toggle() {
      self.isActive = !self.isActive
      self.isRemoved = !self.isRemoved
    }
  }))
  // .view(self => ({
  //   get isActive() {
  //     ret
  //   }
  // }))

export const Token = types
  .model({
    symbol: types.optional(types.boolean),
    name: types.optional(types.string),
    address: types.optional(types.string),
    decimals: types.optional(types.boolean)
  })
// .actions(self => ({
//   toggle() {
//     // self.isActive = !self.isActive
//     // self.isRemoved = !self.isRemoved
//   }
// }))

const Dashboard = types
  .model({
    isAdmin: types.optional(types.boolean, false),
    isFetching: types.optional(types.boolean, false),
    name: types.optional(types.string),
    communityAddress: types.optional(types.string),
    homeTokenAddress: types.optional(types.string),
    foreignTokenAddress: types.optional(types.string),
    plugins: types.map(PluginItem),
    homeToken: types.optional(Token),
    foreignToken: types.optional(Token)
  })
  .actions(self => ({
    fetchCommunity: flow(function* fetchCommunity(communityAddress) {
      this.isFetching = true
      this.isAdmin = false
      self.communityAddress = null
      self.name = null
      self.homeTokenAddress = null
      self.foreignTokenAddress = null
      self.foreignToken = null
      self.homeToken = null
      self.plugins = null
      try {
        self.isFetching = true
        self.communityAddress = communityAddress
        const { data } = yield request
          .get(`${CONFIG.api.url.default}/communities/${communityAddress}`)
          .then(response => response.body)
        self.name = data.name
        self.homeTokenAddress = data.homeTokenAddress
        self.foreignTokenAddress = data.foreignTokenAddress
        const plugins = get(data, 'plugins')
        forEach(plugins, (value, pluginKey) => {
          self.plugins.set(pluginKey, PluginItem.create(value))
        })
        if (data?.homeTokenAddress) {
          self.fetchToken(data?.homeTokenAddress)
        }
      } catch (error) {
        console.error({ error })
      }
    }),
    fetchToken: flow(function* fetchToken(tokenAddress) {
      self.homeToken = null
      try {
        const url = CONFIG.api.url.default
        const response = yield request.get(`${url}/tokens/${tokenAddress}`).then(response => response.body)
        self.homeToken = Token.create({ ...response.data, address: response.data.contractAddress })
      } catch (error) {
        console.error({ error })
      }
    }),
    // checkIsAdmin: flow(function * (communityAddress) {
    // try {
    // if (this?.rootStore?.network?.accountAddress === this?.community?.creatorAddress) {
    //   this.isAdmin = true
    //   return
    // }
    // const admins = yield getCommunityAdmins(communityAddress)
    // const communityEntities = get(admins.data, 'communities[0].entitiesList.communityEntities', [])
    // const entities = keyBy(communityEntities, 'address')
    // self.isAdmin = has(entities, this.rootStore?.network?.accountAddress, false)
    // console.log({ entities })
    //   } catch (error) {
    //     console.log({ error })
    //   }
    // })
  }))
  .views(self => ({
    // get totalItems() {
    //   return self.items.length
    // },
    // get totalPrice() {
    //   return self.items.reduce((sum, entry) => sum + entry.price, 0)
    // }
  }))

export default Dashboard
