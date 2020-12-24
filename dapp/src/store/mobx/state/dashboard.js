import {
  action,
  computed,
  makeObservable,
  observable,
  flow
} from 'mobx'
import get from 'lodash/get'
import omit from 'lodash/omit'
import keyBy from 'lodash/keyBy'
import has from 'lodash/has'
import request from 'superagent'
import pickBy from 'lodash/pickBy'
import { getCommunityAdmins } from 'services/graphql/community.js'
import { getWeb3 } from 'services/web3'
import BasicTokenABI from '@fuse/token-factory-contracts/abi/BasicToken'
import { getWeb3Options } from 'utils/network'

export default class Dashboard {
  community
  plugins
  homeToken
  communityAddress
  foreignToken
  isFetching
  isAdmin
  homeNetwork = 'fuse'
  foreignNetwok
  _web3Home
  _foreignWeb3
  _baseUrl
  tokenBalances = {
    home: 0,
    foreign: 0
  }

  constructor (rootStore) {
    makeObservable(this, {
      community: observable,
      plugins: observable.ref,
      homeToken: observable,
      communityAddress: observable,
      foreignToken: observable,
      isFetching: observable,
      isAdmin: observable,
      tokenBalances: observable,
      addedPlugins: computed,
      web3Context: computed,
      fetchTokenBalances: action,
      fetchCommunity: action,
      setBonus: action
    })
    this.rootStore = rootStore
  }

  addCommunityPlugin = flow(function * ({ communityAddress, plugin }) {
    try {
      const { data } = yield request
        .post(`${this.baseUrl}/communities/${communityAddress}/plugins`)
        .send({ plugin })
        .then(response => response.body)
      this.plugins = get(data, 'plugins')
    } catch (error) {
      console.log({ error })
    }
  })

  initStateByCommunity = community => {
    this.community = { ...omit(community, ['plugins']) }
    this.plugins = { ...get(community, 'plugins') }
    this.foreignNetwork = community.foreignNetworkType

    this._web3Home = getWeb3({ networkType: this.homeNetwork })
    if (this.foreignNetwork) {
      this._web3Foreign = getWeb3({ networkType: this.foreignNetwork })
    }
  }

  fetchCommunity = flow(function * (communityAddress) {
    try {
      this.isFetching = true
      this.communityAddress = communityAddress
      let response = yield request
        .get(`${CONFIG.api.url.main}/communities/${communityAddress}`)
        .then(response => response.body)
      if (response) {
        this.baseUrl = CONFIG.api.url.main
      } else {
        response = yield request
          .get(`${CONFIG.api.url.ropsten}/communities/${communityAddress}`)
          .then(response => response.body)
        this.baseUrl = CONFIG.api.url.ropsten
      }
      const { data } = response
      if (data?.homeTokenAddress) {
        this.fetchHomeToken(data?.homeTokenAddress)
      }
      this.initStateByCommunity(data)

      this.isFetching = false
    } catch (error) {
      this.isFetching = false
      console.log({ error })
    }
  })

  get web3Context () {
    return {
      web3: this.rootStore.network._web3,
      accountAddress: this.rootStore.network.accountAddress,
      web3Options: getWeb3Options('fuse')
    }
  }

  get tokenContext () {
    return {
      web3: this._web3Home,
      isHome: true,
      token: this.homeToken,
      tokenNetworkName: 'fuse',
      tokenBalance: this.tokenBalances.home
    }
  }

  checkIsAdmin = flow(function * (communityAddress) {
    try {
      if (
        this?.rootStore?.network?.accountAddress ===
        this?.community?.creatorAddress
      ) {
        this.isAdmin = true
        return
      }
      const admins = yield getCommunityAdmins(communityAddress)
      const communityEntities = get(
        admins.data,
        'communities[0].entitiesList.communityEntities',
        []
      )
      const entities = keyBy(communityEntities, 'address')
      this.isAdmin = has(
        entities,
        this.rootStore?.network?.accountAddress,
        false
      )
    } catch (error) {
      console.log({ error })
    }
  })

  fetchHomeToken = flow(function * (tokenAddress) {
    try {
      const response = yield request
        .get(`${this.baseUrl}/tokens/${tokenAddress}`)
        .then(response => response.body)
      this.homeToken = { ...response.data }
    } catch (error) {
      console.log({ error })
    }
  })

  fetchTokenBalances = flow(function * (accountAddress) {
    try {
      // Todo fetching from home/foreign token
      const web3 = this._web3Home
      const tokenAddress = this.homeToken?.address
      const basicTokenContract = new web3.eth.Contract(
        BasicTokenABI,
        tokenAddress
      )
      const tokenBalance = yield basicTokenContract.methods
        .balanceOf(accountAddress)
        .call()
      console.log(`balance of token ${tokenAddress} is ${tokenBalance}`)
      this.tokenBalances.home = tokenBalance
    } catch (error) {
      console.log({ error })
    }
  })

  setBonus = (bonusType, amount, isActive) => {
    const infoFieldsMapping = {
      inviteBonus: 'inviteInfo',
      backupBonus: 'backupInfo',
      joinBonus: 'joinInfo'
    }
    const infoField = infoFieldsMapping[bonusType]
    this.addCommunityPlugin({ communityAddress: this.communityAddress, plugin: { name: bonusType, isActive, [infoField]: { amount: amount && amount.toString() } } })
  }

  setWalletBannerLink = flow(function * (link, walletBanner) {
    try {
      const plugin = { name: 'walletBanner', link, isActive: true }
      if (walletBanner && walletBanner.blob) {
        const formData = new window.FormData()
        formData.append('image', walletBanner.blob)
        const { hash } = yield request.post(`${this.baseUrl}/images`)
          .send(formData)
          .then(response => response.body)
        plugin.walletBannerHash = hash
      }
      this.addCommunityPlugin({ communityAddress: this.communityAddress, plugin })
    } catch (error) {

    }
  })

  inviteUserToCommunity = flow(function * ({ email, phoneNumber }) {
    try {
      yield request.post(`${this.baseUrl}/communities/${this.communityAddress}/invite`)
        .send({ email, phoneNumber })
        .then(response => response.body)
    } catch (error) {

    }
  })

  get addedPlugins () {
    return Object.keys(
      pickBy(this?.plugins, pluginKey => !pluginKey?.isRemoved)
    ).sort()
  }
}
