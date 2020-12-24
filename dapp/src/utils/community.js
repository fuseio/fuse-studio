import CommunityABI from '@fuse/entities-contracts/abi/CommunityWithEvents'
import { roles, combineRoles } from '@fuse/roles'

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

export function addBusiness ({ communityAddress, businessAccountAddress, metadata }, { accountAddress, web3, web3Options }) {
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, web3Options)

  const { entityRoles } = deriveEntityData('business')
  const method = CommunityContract.methods.addEntity(businessAccountAddress, entityRoles)
  const transactionPromise = method.send({
    from: accountAddress
  })
  return transactionPromise
}

export function removeBusiness ({ communityAddress, businessAccountAddress }, { accountAddress, web3, web3Options }) {
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, web3Options)

  const method = CommunityContract.methods.removeEntity(businessAccountAddress)
  const transactionPromise = method.send({
    from: accountAddress
  })
  return transactionPromise
}