import CommunityABI from '@fuse/entities-contracts/abi/CommunityWithEvents'
import { roles, combineRoles } from '@fuse/roles'
import { createBusinessMetadata } from 'utils/metadata'

export function deriveEntityData (type, isClosed) {
  if (type === 'user') {
    return { entityRoles: isClosed ? roles.USER_ROLE : combineRoles(roles.APPROVED_ROLE, roles.USER_ROLE) }
  } else if (type === 'business') {
    return { entityRoles: roles.BUSINESS_ROLE }
  }
}

export function addUser ({ communityAddress, userAccountAddress, metadata }, { accountAddress, web3, web3Options }) {
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, web3Options)

  const { entityRoles } = deriveEntityData('user')
  const method = CommunityContract.methods.addEntity(userAccountAddress, entityRoles)
  const transactionPromise = method.send({
    from: accountAddress
  })
  return transactionPromise
}

export function addBusiness ({ communityAddress, businessAccountAddress, metadata }, { accountAddress, web3, web3Options }, { baseUrl}) {
  createBusinessMetadata({ communityAddress, accountAddress: businessAccountAddress, metadata }, { baseUrl })
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, web3Options)

  const { entityRoles } = deriveEntityData('business')
  const method = CommunityContract.methods.addEntity(businessAccountAddress, entityRoles)
  const transactionPromise = method.send({
    from: accountAddress
  })
  return transactionPromise
}

export function removeEntity ({ communityAddress, entityAccountAddress }, { accountAddress, web3, web3Options }) {
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, web3Options)

  const method = CommunityContract.methods.removeEntity(entityAccountAddress)
  const transactionPromise = method.send({
    from: accountAddress
  })
  return transactionPromise
}

export function joinUser ({ communityAddress, metadata }, { accountAddress, web3, web3Options }) {
  // if (data) {
  //   yield call(createUsersMetadata, { communityAddress, accountAddress: data.account, metadata: data })
  // }
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, web3Options)

  const method = CommunityContract.methods.join()
  const transactionPromise = method.send({
    from: accountAddress
  })
  return transactionPromise
}

export function addAdminRole ({ communityAddress, userAccountAddress }, { accountAddress, web3, web3Options }) {
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, web3Options)

  const method = CommunityContract.methods.addEnitityRoles(userAccountAddress, combineRoles(roles.ADMIN_ROLE, roles.APPROVED_ROLE))
  return method.send({
    from: accountAddress
  })
}

export function removeAdminRole ({ communityAddress, userAccountAddress }, { accountAddress, web3, web3Options }) {
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, web3Options)

  const method = CommunityContract.methods.removeEnitityRoles(userAccountAddress, roles.ADMIN_ROLE)
  return method.send({
    from: accountAddress
  })
}
