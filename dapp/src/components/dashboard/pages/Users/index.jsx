import React, { Fragment, useEffect, useState, useMemo } from 'react'
import { push } from 'connected-react-router'
import dotsIcon from 'images/dots.svg'
import isEmpty from 'lodash/isEmpty'
import { useParams } from 'react-router'
import { connect } from 'react-redux'
import sortBy from 'lodash/sortBy'
import identity from 'lodash/identity'
import MyTable from 'components/dashboard/components/Table'
// import { useFetch } from 'hooks/useFetch'

import {
  addEntity,
  fetchEntities,
  removeEntity,
  addAdminRole,
  removeAdminRole,
  confirmUser,
  joinCommunity,
  importExistingEntity,
  fetchUsersMetadata,
  fetchUserWallets
} from 'actions/communityEntities'
import { loadModal, hideModal } from 'actions/ui'
import { ADD_USER_MODAL, ENTITY_ADDED_MODAL } from 'constants/uiConstants'
import { getTransaction } from 'selectors/transaction'

// import { getApiRoot } from 'utils/network'
// import { getForeignNetwork } from 'selectors/network'
import { getCurrentCommunity } from 'selectors/dashboard'
import { getAccountAddress } from 'selectors/accounts'
import { checkIsAdmin } from 'selectors/entities'

import AddBusiness from 'images/add_business.svg'
import Avatar from 'images/avatar.svg'

const Users = ({
  isAdmin,
  community,
  accountAddress,
  loadModal,
  joinCommunity,
  addEntity,
  removeEntity,
  addAdminRole,
  removeAdminRole,
  confirmUser,
  userJustAdded,
  entityAdded,
  push,
  userAccounts,
  communityEntities,
  fetchUsersMetadata,
  fetchUserWallets,
  walletAccounts,
  userWallets,
  users
}) => {
  const { address: communityAddress } = useParams()
  const [data, setData] = useState([])

  useEffect(() => {
    if (userAccounts && userAccounts.length > 0) {
      fetchUsersMetadata(userAccounts)
      fetchUserWallets(userAccounts)
    }
  }, [userAccounts])

  useEffect(() => {
    if (walletAccounts && walletAccounts.length > 0) {
      const walletOwners = walletAccounts.map(wallet => userWallets[wallet].owner)
      fetchUsersMetadata(walletOwners)
    }
  }, [walletAccounts])

  useEffect(() => {
    const userEntities = userAccounts.map(account => communityEntities[account])
    if (!isEmpty(userEntities)) {
      const data = userEntities.map(({ isAdmin, isApproved, address, createdAt }) => {
        const metadataAddress = userWallets[address] ? userWallets[address].owner : address
        const metadata = users[metadataAddress]
        return ({
          isApproved,
          isAdmin,
          createdAt: new Date(createdAt * 1000).toUTCString(),
          name: metadata
            ? [
              {
                name: metadata.name,
                image: metadata.image
                  ? <div
                    style={{
                      backgroundImage: `url(https://ipfs.infura.io/ipfs/${metadata.image.contentUrl['/']})`,
                      width: '36px',
                      height: '36px',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  />
                  : <div
                    style={{
                      backgroundImage: `url(${Avatar})`,
                      width: '36px',
                      height: '36px',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  />
              }
            ]
            : [
              {
                name: '',
                image: <div
                  style={{
                    backgroundImage: `url(${Avatar})`,
                    width: '36px',
                    height: '36px',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
              }
            ],
          address,
          status: isAdmin
            ? 'Community admin'
            : (community && !community.isClosed)
              ? 'Community user'
              : isApproved
                ? 'Community user'
                : 'Pending user'
        })
      }, ['updatedAt']).reverse()
      setData(sortBy(data))
    }

    return () => { }
  }, [userAccounts, users])

  useEffect(() => {
    if (entityAdded) {
      setTimeout(() => {
        loadModal(ENTITY_ADDED_MODAL, {
          type: 'users',
          name: userJustAdded
        })
      }, 1000)
    }
    return () => {}
  }, [entityAdded])

  const tableData = useMemo(() => data, [data])

  const columns = useMemo(() => [
    {
      id: 'checkbox',
      accessor: '',
      Cell: (rowInfo) => {
        return null
        // return (
        //   <input
        //     type='checkbox'
        //     className='row_checkbox'
        //     checked={rowInfo.value.checkbox}
        //     // checked={this.state.selected[rowInfo.original.title.props.children] === true}
        //     onChange={() => this.toggleRow(rowInfo.row.original)}
        //   />
        // )
      }
    },
    {
      Header: 'Name',
      accessor: 'name'
    },
    {
      Header: 'Status',
      accessor: 'status'
    },
    {
      Header: 'Account ID',
      accessor: 'address',
      isEthereumAddress: true
    },
    {
      Header: 'Date',
      accessor: 'createdAt'
    },
    {
      id: 'dropdown',
      accessor: '',
      Cell: (rowInfo) => {
        const { isApproved, hasAdminRole, address } = rowInfo.row.original
        return (
          isAdmin ? (
            <div className='table__body__cell__more'>
              <div className='table__body__cell__more__toggler'>
                <img src={dotsIcon} />
              </div>
              <div className='more' onClick={e => e.stopPropagation()}>
                {
                  !isApproved && !hasAdminRole && (
                    <ul className='more__options'>
                      <li className='more__options__item' onClick={() => handleConfirmUser(address)}>Confirm</li>
                      <li className='more__options__item' onClick={() => handleAddAdminRole(address)}>Make admin</li>
                      <li className='more__options__item' onClick={() => handleRemoveEntity(address)}>Remove</li>
                      <li className='more__options__item' onClick={() => push(`transfer/${address}`)}>Transfer tokens to user</li>
                    </ul>
                  )
                }
                {
                  hasAdminRole && isApproved && (
                    <ul className='more__options'>
                      <li className='more__options__item' onClick={() => handleRemoveEntity(address)}>Remove</li>
                      <li className='more__options__item' onClick={() => push(`transfer/${address}`)}>Transfer tokens to user</li>
                      <li className='more__options__item' onClick={() => handleRemoveAdminRole(address)}>Remove as admin</li>
                    </ul>
                  )
                }
                {
                  hasAdminRole && !isApproved && (
                    <ul className='more__options'>
                      <li className='more__options__item' onClick={() => handleConfirmUser(address)}>Confirm</li>
                      <li className='more__options__item' onClick={() => handleRemoveEntity(address)}>Remove</li>
                      <li className='more__options__item' onClick={() => push(`transfer/${address}`)}>Transfer tokens to user</li>
                      <li className='more__options__item' onClick={() => handleRemoveAdminRole(address)}>Remove as admin</li>
                    </ul>
                  )
                }
                {
                  !hasAdminRole && isApproved && (
                    <ul className='more__options'>
                      <li className='more__options__item' onClick={() => handleRemoveEntity(address)}>Remove</li>
                      <li className='more__options__item' onClick={() => push(`transfer/${address}`)}>Transfer tokens to user</li>
                      <li className='more__options__item' onClick={() => handleAddAdminRole(address)}>Make admin</li>
                    </ul>
                  )
                }
              </div>
            </div>
          ) : (<div className='table__body__cell__more'>
            <div className='table__body__cell__more__toggler'>
              <img src={dotsIcon} />
            </div>
            <div className='more' onClick={e => e.stopPropagation()}>
              {
                !isApproved && !hasAdminRole && (
                  <ul className='more__options'>
                    <li className='more__options__item' onClick={() => push(`transfer/${address}`)}>Transfer tokens to user</li>
                  </ul>
                )
              }
            </div>
          </div>
          )
        )
      }
    }
  ], [isAdmin])

  const handleAddUser = () => loadAddUserModal()

  const loadAddUserModal = (isJoin) => {
    const submitEntity = isJoin ? joinCommunity : addEntity
    loadModal(ADD_USER_MODAL, {
      isJoin,
      entity: isJoin ? { account: accountAddress } : undefined,
      submitEntity: (data) => submitEntity((communityAddress), { ...data }, (community && community.isClosed), 'user')
    })
  }

  const handleJoinCommunity = () => loadAddUserModal(true)

  const handleRemoveEntity = (account) => removeEntity(account)

  const handleAddAdminRole = (account) => addAdminRole(account)

  const handleRemoveAdminRole = (account) => removeAdminRole(account)

  const handleConfirmUser = (account) => confirmUser(account)

  const renderTable = () => {
    return (
      <MyTable
        addActionProps={{
          placeholder: 'Search a user',
          // action: isAdmin ? handleAddUser : handleJoinCommunity,
          isAdmin,
          onChange: identity
          // text: isAdmin ? 'Add user' : 'Join community',
        }}
        data={tableData}
        justAdded={entityAdded}
        columns={columns}
        pageSize={100}
      />
    )
  }

  const renderContent = () => {
    if (data && data.length > 0) {
      return renderTable()
    } else {
      return (
        <div className='entities__empty-list'>
          <img src={AddBusiness} />
          <div className='entities__empty-list__title'>Add a user to your List!</div>
          <button
            className='entities__empty-list__btn'
            onClick={isAdmin ? handleAddUser : handleJoinCommunity}
          >
            {isAdmin ? 'Add user' : 'Join'}
          </button>
        </div>
      )
    }
  }

  return (
    <Fragment>
      <div className='entities__header'>
        <h2 className='entities__header__title'>Users list</h2>
      </div>
      <div className='entities__wrapper'>
        {renderContent()}
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  communityEntities: state.entities.communityEntities,
  accountAddress: getAccountAddress(state),
  users: state.entities.users,
  userWallets: state.entities.wallets,
  ...state.screens.communityEntities,
  isAdmin: checkIsAdmin(state),
  community: getCurrentCommunity(state),
  transactionData: getTransaction(state, state.screens.communityEntities.transactionHash)
})

const mapDispatchToProps = {
  push,
  joinCommunity,
  addEntity,
  confirmUser,
  addAdminRole,
  removeAdminRole,
  removeEntity,
  loadModal,
  hideModal,
  fetchEntities,
  importExistingEntity,
  fetchUsersMetadata,
  fetchUserWallets
}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
