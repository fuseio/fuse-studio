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
import HomeMultiAMBErc20ToErc677 from 'constants/abi/HomeMultiAMBErc20ToErc677'
import BasicTokenABI from '@fuse/token-factory-contracts/abi/BasicToken'
import { getBridgeMediator, homeToForeignBridgeMediators } from 'utils/bridge'
import { isZeroAddress } from 'utils/web3'
import { BigNumber } from 'bignumber.js'
import { loadState } from 'utils/storage'

export default class Dashboard {
  community
  plugins
  homeToken
  communityAddress
  foreignToken
  isFetching
  isAdmin
  fuseBalance
  homeNetwork = 'fuse'
  foreignNetwork
  _web3Home
  _foreignWeb3
  baseUrl
  entitiesCount
  isCommunityMember
  metadata
  communityUsers
  communityBusinesses
  communityAdmins

  tokenBalances = {}

  allowance = {}

  totalSupply = {
    home: 0,
    foreign: 0
  }

  constructor (rootStore) {
    makeObservable(this, {
      metadata: observable.ref,
      community: observable.ref,
      plugins: observable.ref,
      homeToken: observable.ref,
      communityAddress: observable,
      foreignToken: observable.ref,
      isFetching: observable,
      isAdmin: observable,
      communityUsers: observable,
      communityBusinesses: observable,
      entitiesCount: observable,
      tokenBalances: observable.shallow,
      totalSupply: observable.shallow,
      allowance: observable.shallow,
      addedPlugins: computed,
      bridgeStatus: computed,
      tokenContext: computed,
      communityTotalSupply: computed,
      fetchTokenBalances: action,
      fetchCommunity: action,
      fetchCommunityAdmins: action,
      fetchHomeToken: action,
      setWalletBannerLink: action,
      inviteUserToCommunity: action,
      addCommunityPlugin: action,
      setBonus: action,
      fetchCommunityUsers: action,
      fetchTokensTotalSupply: action,
      fetchEntitiesCount: action,
      checkIsCommunityMember: action,
      fetchMetadata: action,
      fetchFuseFunderBalance: action
    })
    this.rootStore = rootStore
  }

  fetchMetadata = flow(function * (uri) {
    try {
      if (uri.startsWith('ipfs://')) {
        const { data } = yield request
          .get(`${this.baseUrl}/metadata/${uri}`)
          .then(response => response.body)
        this.metadata = { ...data }
      } else {
        const { data } = yield request.get(uri)
          .then(response => response.body)
        this.metadata = { ...data }
      }
    } catch (error) {
      console.log('ERROR in addCommunityPlugin', { error })
    }
  })

  fetchFuseFunderBalance = flow(function * () {
    try {
      const { user } = loadState('persist:root')
      const { jwtToken } = JSON.parse(user)
      const url = CONFIG.api.v2.url[this.foreignNetwork || 'main']
      const { data } = yield request
        .get(`${url}/communities/accounting/balance/${this.communityAddress}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .then(response => response.body)
      this.fuseBalance = data.balance
    } catch (error) {
      console.log('ERROR in fetchFunderBalance', { error })
    }
  })

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

  registerForeignTokenAddress = flow(function * ({ foreignTokenAddress }) {
    try {
      const response = yield request
        .put(`${this.baseUrl}/communities/${this.communityAddress}/foreignToken`)
        .send({ foreignTokenAddress })
        .then(response => response.body)
      this.community = { ...response.data }
    } catch (error) {
      console.log('ERROR in addCommunityPlugin', { error })
    }
  })

  addBridgePlugin = flow(function * ({ bridgeType, bridgeDirection }) {
    const response = yield request
      .put(`${this.baseUrl}/communities/${this.communityAddress}/bridge`)
      .send({ bridgeType, bridgeDirection })
      .then(response => response.body)
    this.community = { ...response.data }
  })

  initStateByCommunity = community => {
    this.community = { ...omit(community, ['plugins']) }
    this.plugins = { ...get(community, 'plugins') }

    this._web3Home = getWeb3({ networkType: this.homeNetwork })
    if (this.foreignNetwork) {
      this._web3Foreign = getWeb3({ networkType: this.foreignNetwork })
    }

    this.fetchTokensTotalSupply()

    if (community?.communityURI) {
      this.fetchMetadata(community?.communityURI)
    }

    if (community?.homeTokenAddress) {
      this.fetchHomeToken(community?.homeTokenAddress)
    }

    if (community?.foreignTokenAddress) {
      this.fetchForeignToken(community?.foreignTokenAddress)
    } else if (community?.bridgeDirection === 'home-to-foreign') {
      this.fetchHomeTokenAddress(community?.homeTokenAddress)
    }
  }

  fetchHomeTokenAddress = flow(function * (homeTokenAddress) {
    try {
      const bridgeMediator = homeToForeignBridgeMediators.ethereum
      const contract = new this._web3Foreign.eth.Contract(HomeMultiAMBErc20ToErc677, bridgeMediator)
      const foreignTokenAddress = yield contract.methods.homeTokenAddress(homeTokenAddress).call()
      if (!isZeroAddress(foreignTokenAddress)) {
        this.registerForeignTokenAddress({ foreignTokenAddress })
        this.fetchForeignToken(foreignTokenAddress)
      }
    } catch (error) {
      console.log({ error })
    }
  })

  fetchCommunity = flow(function * (communityAddress) {
    try {
      this.isAdmin = false
      this.homeToken = {}
      this.foreignToken = {}
      this.community = {}
      this.tokenBalances = {}
      this.plugins = {}
      this.allowance = {}
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

  fetchCommunityAdmins = flow(function * (communityAddress) {
    try {
      const admins = yield getCommunityAdmins(communityAddress)
      const communityEntities = get(
        admins.data,
        'communities[0].entitiesList.communityEntities',
        []
      )
      this.communityAdmins = communityEntities
      const entities = keyBy(communityEntities, 'address')

      if (
        this?.rootStore?.network?.accountAddress ===
        this?.community?.creatorAddress
      ) {
        this.isAdmin = true
        return
      }
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
        contract.methods.decimals().call()
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
        contract.methods.decimals().call()
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
      console.log('ERROR in fetchTokensTotalSupply', { error })
    }
  })

  checkAllowance = flow(function * (accountAddress) {
    try {
      if (this?.community?.homeTokenAddress) {
        const web3 = this._web3Home
        let bridgeMediator
        const basicTokenContract = new web3.eth.Contract(
          BasicTokenABI,
          this?.community?.homeTokenAddress
        )
        if (this?.community?.bridgeDirection === 'foreign-to-home') {
          bridgeMediator = getBridgeMediator('home', this.foreignNetwork)
        } else {
          bridgeMediator = homeToForeignBridgeMediators.ethereum
        }
        const bridgeMediatorAllowance = yield basicTokenContract.methods.allowance(accountAddress, bridgeMediator).call()
        this.allowance[this?.community?.homeTokenAddress] = bridgeMediatorAllowance
      }
      if (this?.community?.foreignTokenAddress) {
        let bridgeMediator
        const web3 = this._web3Foreign
        const contract = new web3.eth.Contract(
          BasicTokenABI,
          this.community?.foreignTokenAddress
        )
        if (this?.community?.bridgeDirection === 'foreign-to-home') {
          bridgeMediator = getBridgeMediator('foreign', this.foreignNetwork)
        } else {
          bridgeMediator = homeToForeignBridgeMediators.fuse
        }
        const bridgeMediatorAllowance = yield contract.methods.allowance(accountAddress, bridgeMediator).call()
        this.allowance[this?.community?.foreignTokenAddress] = bridgeMediatorAllowance
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
        this.tokenBalances[this?.community?.homeTokenAddress] = balanceHome
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
        this.tokenBalances[this?.community?.foreignTokenAddress] = balanceForeign
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
      console.log('ERROR in fetchEntitiesCount', { error })
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

  get bridgeStatus () {
    if (this?.community?.bridgeDirection === 'home-to-foreign') {
      if (this.rootStore.network.networkId === 122) {
        return {
          from: {
            network: this.rootStore.network.homeNetwork,
            bridge: 'foreign',
            tokenAddress: this?.community?.homeTokenAddress
          },
          to: {
            network: this.foreignNetwork,
            bridge: 'home',
            balanceKey: 'ethereum',
            tokenAddress: this?.community?.foreignTokenAddress
          }
        }
      } else {
        return {
          from: {
            network: this.foreignNetwork,
            bridge: 'home',
            tokenAddress: this?.community?.foreignTokenAddress
          },
          to: {
            network: this.rootStore.network.homeNetwork,
            bridge: 'foreign',
            tokenAddress: this?.community?.homeTokenAddress
          }
        }
      }
    } else {
      if (this.rootStore.network.networkId === 122) {
        return {
          from: {
            network: this.rootStore.network.homeNetwork,
            bridge: 'home',
            tokenAddress: this?.community?.homeTokenAddress
          },
          to: {
            network: this.foreignNetwork,
            bridge: 'foreign',
            tokenAddress: this?.community?.foreignTokenAddress
          }
        }
      } else {
        return {
          from: {
            network: this.foreignNetwork,
            bridge: 'foreign',
            tokenAddress: this?.community?.foreignTokenAddress
          },
          to: {
            network: this.rootStore.network.homeNetwork,
            bridge: 'home',
            tokenAddress: this?.community?.homeTokenAddress
          }
        }
      }
    }
  }

  get tokenContext () {
    return {
      web3: this._web3Home,
      isHome: true,
      token: this.homeToken,
      tokenAddress: this.community?.homeTokenAddress,
      tokenNetworkName: 'fuse',
      tokenBalance: this.tokenBalances.home,
      baseUrl: this.baseUrl
    }
  }

  get communityTotalSupply () {
    return {
      home: this?.community?.bridgeDirection === 'foreign-to-home'
        ? new BigNumber(this?.homeToken?.totalSupply)
        : new BigNumber(this.homeToken.totalSupply).minus(this.foreignToken.totalSupply),
      foreign: this?.community?.bridgeDirection === 'foreign-to-home'
        ? new BigNumber(this.foreignToken.totalSupply).minus(this.homeToken.totalSupply)
        : new BigNumber(this?.foreignToken?.totalSupply),
      total: this?.community?.bridgeDirection === 'foreign-to-home'
        ? new BigNumber(this.foreignToken.totalSupply).minus(this.homeToken.totalSupply)
        : new BigNumber(this?.homeToken?.totalSupply)
    }
  }
}
