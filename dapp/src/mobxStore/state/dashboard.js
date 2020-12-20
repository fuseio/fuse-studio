import { action, computed, toJS, observable, flow, extendObservable, set, get as mobxGet } from 'mobx'
// import * as entitiesApi from 'services/api/entities'
import clone from 'lodash/clone'
import get from 'lodash/get'
import omit from 'lodash/omit'
import keyBy from 'lodash/keyBy'
import has from 'lodash/has'
import request from 'superagent'
import pickBy from 'lodash/pickBy'
import { getCommunityAdmins } from 'services/graphql/community.js'

export default class Dashboard {
  @observable community
  @observable plugins
  @observable homeToken // = observable.map({})
  @observable communityAddress
  @observable foreignToken
  @observable isFetching
  @observable isAdmin

  constructor(rootStore) {
    this.rootStore = rootStore
  }

  addCommunityPlugin = flow(function* ({ communityAddress, plugin }) {
    try {
      console.log({ communityAddress, plugin })
      const url = CONFIG.api.url.default
      const { data } = yield request
        .post(`${url}/communities/${communityAddress}/plugins`)
        .send({ plugin })
        .then(response => response.body)
      console.log({ ...get(data, 'plugins') })

      this.plugins = get(data, 'plugins')
    } catch (error) {
      console.log({ error })
    }
  })

  fetchCommunity = flow(function* (communityAddress) {
    try {
      this.isFetching = true
      this.communityAddress = communityAddress
      const { data } = yield request
        .get(`${CONFIG.api.url.default}/communities/${communityAddress}`)
        .then(response => response.body)
      if (data?.homeTokenAddress) {
        this.fetchHomeToken(data?.homeTokenAddress)
      }
      this.community = { ...this.community, ...omit(data, ['plugins']) }
      this.plugins = { ...this.plugins, ...get(data, 'plugins') }
      this.isFetching = false
    } catch (error) {
      this.isFetching = false
      console.log({ error })
    }
  })

  checkIsAdmin = flow(function* (communityAddress) {
    try {
      if (this?.rootStore?.network?.accountAddress === this?.community?.creatorAddress) {
        this.isAdmin = true
        return
      }
      const admins = yield getCommunityAdmins(communityAddress)
      const communityEntities = get(admins.data, 'communities[0].entitiesList.communityEntities', [])
      const entities = keyBy(communityEntities, 'address')
      this.isAdmin = has(entities, this.rootStore?.network?.accountAddress, false)
    } catch (error) {
      console.log({ error })
    }
  })

  fetchHomeToken = flow(function* (tokenAddress) {
    try {
      // Todo fetching from home/foreign token
      const url = CONFIG.api.url.default
      const response = yield request.get(`${url}/tokens/${tokenAddress}`).then(response => response.body)
      this.homeToken = { ...response.data }
    } catch (error) {
      console.log({ error })
    }
  })

  @computed
  get addedPlugins () {
    return Object.keys(pickBy(this?.plugins, (pluginKey) => !pluginKey?.isRemoved)).sort()
  }
}
