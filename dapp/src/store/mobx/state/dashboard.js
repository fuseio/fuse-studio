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
import { getCommunityAdmins, fetchCommunityUsers as fetchCommunityUsersApi, fetchCommunityBusinesses as fetchCommunityBusinessesApi, isCommunityMember, fetchCommunityEntities } from 'services/graphql/community.js'
import { getWeb3 } from 'services/web3'
import BasicTokenABI from '@fuse/token-factory-contracts/abi/BasicToken'
<<<<<<< HEAD
import { getBridgeMediator } from 'utils/bridge'
=======
>>>>>>> working

export default class Dashboard {
  community
  plugins
  homeToken
  communityAddress
  foreignToken
  isFetching
  isAdmin
  homeNetwork = 'fuse'
  foreignNetwork
  _web3Home
  _foreignWeb3
  baseUrl
  entitiesCount
  isCommunityMember
  tokenBalances = {
    home: 0,
    foreign: 0
  }
  communityUsers
  communityBusinesses

  allowance = {
    home: 0,
    foreign: 0
  }

  totalSupply = {
    home: 0,
    foreign: 0
  }

  constructor (rootStore) {
    makeObservable(this, {
      community: observable.ref,
      plugins: observable.ref,
      homeToken: observable.ref,
      communityAddress: observable,
      foreignToken: observable,
      isFetching: observable,
      isAdmin: observable,
      tokenBalances: observable,
      communityUsers: observable,
      communityBusinesses: observable,
      entitiesCount: observable,
      totalSupply: observable,
      allowance: observable,
      addedPlugins: computed,
      fetchTokenBalances: action,
      fetchCommunity: action,
      checkIsAdmin: action,
      fetchHomeToken: action,
      setWalletBannerLink: action,
      inviteUserToCommunity: action,
      addCommunityPlugin: action,
      setBonus: action,
      fetchCommunityUsers: action,
      fetchTokensTotalSupply: action,
      fetchEntitiesCount: action,
      checkIsCommunityMember: action
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
      console.log('ERROR in addCommunityPlugin', { error })
    }
  })

  initStateByCommunity = community => {
    this.community = { ...omit(community, ['plugins']) }
    this.plugins = { ...get(community, 'plugins') }

    this._web3Home = getWeb3({ networkType: this.homeNetwork })
    if (this.foreignNetwork) {
      this._web3Foreign = getWeb3({ networkType: this.foreignNetwork })
    }
    if (community?.homeTokenAddress) {
      this.fetchHomeToken(community?.homeTokenAddress)
    }

    if (community?.foreignTokenAddress) {
      this.fetchForeignToken(community?.foreignTokenAddress)
    }
  }

  fetchCommunity = flow(function * (communityAddress) {
    try {
      this.isAdmin = false
      this.homeToken = {}
      this.foreignToken = {}
      this.community = {}
      this.tokenBalances = {
        home: 0,
        foreign: 0
      }
      this.plugins = {}
      this.allowance = {
        home: 0,
        foreign: 0
      }
      this.totalSupply = {
        home: 0,
        foreign: 0
      }
      this.isFetching = true
      this.communityAddress = communityAddress
      let response = yield request
        .get(`${CONFIG.api.url.main}/communities/${communityAddress}`)
        .then(response => response.body)
      if (response.data) {
        this.baseUrl = CONFIG.api.url.main
        this.foreignNetwork = 'main'
      } else {
        response = yield request
          .get(`${CONFIG.api.url.ropsten}/communities/${communityAddress}`)
          .then(response => response.body)
        this.baseUrl = CONFIG.api.url.ropsten
        this.foreignNetwork = 'ropsten'
      }
      const { data } = response
      this.fetchEntitiesCount(communityAddress)
      this.initStateByCommunity(data)

      this.isFetching = false
    } catch (error) {
      this.isFetching = false
      console.log('ERROR in fetchCommunity', { error })
    }
  })

  get bridgeStatus () {
    if (this.rootStore.network.networkId === 122) {
      return {
        from: {
          network: this.rootStore.network.homeNetwork,
          bridge: 'home'
        },
        to: {
          network: this.foreignNetwork,
          bridge: 'foreign'
        }
      }
    } else {
      return {
        from: {
          network: this.foreignNetwork,
          bridge: 'foreign'
        },
        to: {
          network: this.rootStore.network.homeNetwork,
          bridge: 'home'
        }
      }
    }
  }

  get tokenContext () {
    return {
      web3: this._web3Home,
      isHome: true,
      token: this.homeToken,
      tokenAddress: this.community.homeTokenAddress,
      tokenNetworkName: 'fuse',
      tokenBalance: this.tokenBalances.home,
      baseUrl: this.baseUrl
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

  fetchCommunityUsers = flow(function * (communityAddress) {
    try {
      const response = yield fetchCommunityUsersApi(communityAddress)
      this.communityUsers = get(
        response.data,
        'communities[0].entitiesList.communityEntities',
        []
      )
    } catch (error) {
      console.log({ error })
    }
  })

  fetchCommunityBusinesses = flow(function * (communityAddress) {
    try {
      const response = yield fetchCommunityBusinessesApi(communityAddress)
      this.communityBusinesses = get(
        response.data,
        'communities[0].entitiesList.communityEntities',
        []
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
      const contract = new this._web3Home.eth.Contract(BasicTokenABI, tokenAddress)
      const [name, symbol, totalSupply, decimals] = yield Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.totalSupply().call(),
        contract.methods.decimals().call(),
      ])
      this.homeToken = { ...response.data, name, symbol, totalSupply, decimals }
    } catch (error) {
      console.log({ error })
    }
  })

  fetchForeignToken = flow(function * (tokenAddress) {
    try {
      const contract = new this._web3Foreign.eth.Contract(BasicTokenABI, tokenAddress)
      const [name, symbol, totalSupply, decimals] = yield Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.totalSupply().call(),
        contract.methods.decimals().call(),
      ])
      this.foreignToken = { name, symbol, totalSupply, decimals }
    } catch (error) {
      console.log({ error })
    }
  })

  fetchTokensTotalSupply = flow(function * () {
    try {
      if (this?.community?.homeTokenAddress) {
        const web3 = this._web3Home
        const tokenAddress = this?.community?.homeTokenAddress
        const basicTokenContract = new web3.eth.Contract(
          BasicTokenABI,
          tokenAddress
        )
        const totalSupplyHome = yield basicTokenContract.methods
          .totalSupply()
          .call()
        this.totalSupply.home = totalSupplyHome
      }
      if (this?.community?.foreignTokenAddress) {
        const web3 = this._web3Foreign
        const contract = new web3.eth.Contract(
          BasicTokenABI,
          this.community?.foreignTokenAddress
        )
        const totalSupplyForeign = yield contract.methods
          .totalSupply()
          .call()
        this.totalSupply.foreign = totalSupplyForeign
      }
    } catch (error) {
      console.log('ERROR in fetchTokenBalances', { error })
    }
  })

  checkAllowance = flow(function * (accountAddress) {
    try {
      if (this?.community?.homeTokenAddress) {
        const web3 = this._web3Home
        const basicTokenContract = new web3.eth.Contract(
          BasicTokenABI,
          this?.community?.homeTokenAddress
        )
        const bridgeMediator = getBridgeMediator('home', this.foreignNetwork)
        this.allowance.home = yield basicTokenContract.methods.allowance(accountAddress, bridgeMediator).call()
      }
      if (this?.community?.foreignTokenAddress) {
        const web3 = this._web3Foreign
        const contract = new web3.eth.Contract(
          BasicTokenABI,
          this.community?.foreignTokenAddress
        )
        const bridgeMediator = getBridgeMediator('foreign', this.foreignNetwork)
        this.allowance.foreign = yield contract.methods.allowance(accountAddress, bridgeMediator).call()
      }
    } catch (error) {
      console.log('ERROR in checkAllowance', { error })
    }
  })

  fetchTokenBalances = flow(function * (accountAddress) {
    try {
      if (this?.community?.homeTokenAddress) {
        const web3 = this._web3Home
        const tokenAddress = this?.community?.homeTokenAddress
        const basicTokenContract = new web3.eth.Contract(
          BasicTokenABI,
          tokenAddress
        )
        const balanceHome = yield basicTokenContract.methods
          .balanceOf(accountAddress)
          .call()
          this.tokenBalances.home = balanceHome
      }
      if (this?.community?.foreignTokenAddress) {
        const web3 = this._web3Foreign
        const contract = new web3.eth.Contract(
          BasicTokenABI,
          this.community?.foreignTokenAddress
        )
        const balanceForeign = yield contract.methods
          .balanceOf(accountAddress)
          .call()
          this.tokenBalances.foreign = balanceForeign
      }
    } catch (error) {
      console.log('ERROR in fetchTokenBalances', { error })
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

  fetchEntitiesCount = flow(function * (communityAddress) {
    try {
      const { data } = yield fetchCommunityEntities(communityAddress)
      const communityEntities = get(data, 'communities[0].entitiesList.communityEntities', [])
      this.entitiesCount = communityEntities.length
    } catch (error) {
      console.log('ERROR in addCommunityPlugin', { error })
    }
  })

  checkIsCommunityMember = flow(function * (accountAddress) {
    const memberData = yield isCommunityMember(this.communityAddress, accountAddress)
    this.isCommunityMember = memberData?.data?.communityEntities?.length > 0
  })


  get addedPlugins () {
    return Object.keys(
      pickBy(this?.plugins, pluginKey => !pluginKey?.isRemoved)
    ).sort()
  }
}
