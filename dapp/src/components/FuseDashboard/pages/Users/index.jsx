import React, { useEffect, useState, useMemo } from 'react'
import { push } from 'connected-react-router'
import dotsIcon from 'images/dots.svg'
import isEmpty from 'lodash/isEmpty'
import { useParams, withRouter } from 'react-router'
import { connect, useSelector } from 'react-redux'
import sortBy from 'lodash/sortBy'
import identity from 'lodash/identity'
import MyTable from 'components/FuseDashboard/components/Table'
import TransactionMessage from 'components/common/TransactionMessage'
import { getForeignNetwork } from 'selectors/network'
import CopyToClipboard from 'components/common/CopyToClipboard'
import FontAwesome from 'react-fontawesome'
import { addressShortener } from 'utils/format'
import { getBlockExplorerUrl } from 'utils/network'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { autorun } from "mobx"

import {
  addEntity,
  removeEntity,
  addAdminRole,
  removeAdminRole,
  joinCommunity,
  importExistingEntity,
  fetchUsersMetadata
} from 'actions/communityEntities'
import { addMinter } from 'actions/token'
import { loadModal, hideModal } from 'actions/ui'
import { ADD_USER_MODAL, ENTITY_ADDED_MODAL } from 'constants/uiConstants'
import { getTransaction } from 'selectors/transaction'

import { getCurrentCommunity } from 'selectors/dashboard'
import { getAccountAddress } from 'selectors/accounts'

import AddBusiness from 'images/add_business.svg'
import Avatar from 'images/avatar.svg'

const Users = ({
  accountAddress,
  loadModal,
  joinCommunity,
  addEntity,
  removeEntity,
  addAdminRole,
  removeAdminRole,
  addMinter,
  userJustAdded,
  entityAdded,
  push,
  fetchUsersMetadata,
  usersMetadata,
  showTransactionMessage,
  signatureNeeded,
  join
}) => {
  const { dashboard } = useStore()
  const { community, communityUsers, isAdmin } = dashboard


  const { address: communityAddress } = useParams()
  const [data, setData] = useState([])
  const foreignNetwork = useSelector(getForeignNetwork)

  useEffect (( )=> {
    dashboard.fetchCommunityUsers(communityAddress)
  }, [])

  useEffect(() => {
    if (join) {
      handleJoinCommunity()
    }
  }, [join])

  useEffect(() => autorun(() => {
    if (communityUsers && communityUsers.length > 0) {
      fetchUsersMetadata(communityUsers.map(u => u.address))
    }
  }), [communityUsers])

  useEffect(() => autorun(() => {
    if (!isEmpty(communityUsers)) {
      const data = communityUsers.map(({ isAdmin, isApproved, address, createdAt, displayName }) => {
        const metadata = usersMetadata[address]
        return ({
          isApproved,
          hasAdminRole: isAdmin,
          createdAt: new Date(createdAt * 1000),
          name: metadata
            ? [
              {
                name: metadata.name || metadata.displayName,
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
                name: displayName,
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
  }), [communityUsers, usersMetadata])

  useEffect(() => {
    if (entityAdded) {
      setTimeout(() => {
        loadModal(ENTITY_ADDED_MODAL, {
          type: 'users',
          name: userJustAdded
        })
      }, 1000)
    }
    return () => { }
  }, [communityUsers, entityAdded])

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
      Cell: ({ cell: { value } }) => (
        <React.Fragment>
          <a
            className='link'
            target='_blank'
            rel='noopener noreferrer'
            href={`${getBlockExplorerUrl('fuse')}/address/${value}`}>
            {addressShortener(value)}
          </a>
          <CopyToClipboard text={value}>
            <FontAwesome name='clone' />
          </CopyToClipboard>
        </React.Fragment>
      )
    },
    {
      Header: 'Date',
      accessor: 'createdAt',
      sortType: 'datetime',
      Cell: ({ cell: { value } }) => value.toUTCString()
    },
    {
      id: 'dropdown',
      accessor: '',
      Cell: (rowInfo) => {
        const { hasAdminRole, address } = rowInfo.row.original
        return (
          isAdmin ? (
            <div className='table__body__cell__more'>
              <div className='table__body__cell__more__toggler'>
                <img src={dotsIcon} />
              </div>
              <div className='more' onClick={e => e.stopPropagation()}>
                {
                  !hasAdminRole && (
                    <ul className='more__options'>
                      <li className='more__options__item' onClick={() => handleAddAdminRole(address)}>Make admin</li>
                      <li className='more__options__item' onClick={() => handleRemoveEntity(address)}>Remove</li>
                      {accountAddress && accountAddress.toLowerCase() !== address.toLowerCase() && <li className='more__options__item' onClick={() => handleAddMinter(address)}>Make Minter</li>}
                      <li className='more__options__item' onClick={() => push(`transfer/${address}`)}>Transfer tokens to user</li>
                    </ul>
                  )
                }
                {
                  hasAdminRole && (
                    <ul className='more__options'>
                      {accountAddress && accountAddress.toLowerCase() !== address.toLowerCase() && <li className='more__options__item' onClick={() => handleRemoveEntity(address)}>Remove</li>}
                      {accountAddress && accountAddress.toLowerCase() !== address.toLowerCase() && <li className='more__options__item' onClick={() => handleRemoveAdminRole(address)}>Remove as admin</li>}
                      <li className='more__options__item' onClick={() => handleAddMinter(address)}>Make Minter</li>
                      <li className='more__options__item' onClick={() => push(`transfer/${address}`)}>Transfer tokens to user</li>
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
                <ul className='more__options'>
                  <li className='more__options__item' onClick={() => push(`transfer/${address}`)}>Transfer tokens to user</li>
                </ul>
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

  const handleAddMinter = (account) => addMinter(community.foreignTokenAddress, account, { desiredNetworkType: foreignNetwork })

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
        size={100}
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
          <button
            className='entities__empty-list__btn'
            onClick={isAdmin ? handleAddUser : handleJoinCommunity}
          >
            {isAdmin ? 'Add user' : `Join ${(community && community.name)}`}
          </button>
        </div>
      )
    }
  }

  return (
    <>
      <div className='entities__header'>
        <h2 className='entities__header__title'>Users list</h2>
      </div>
      <div className='entities__wrapper'>
        {renderContent()}
        <TransactionMessage
          title={'Joining Community'}
          message={signatureNeeded ? 'Please sign with your wallet' : 'Pending'}
          isOpen={showTransactionMessage}
          isDark
        />
      </div>
    </>
  )
}

const mapStateToProps = (state, { match }) => ({
  join: match.params.join,
  accountAddress: getAccountAddress(state),
  usersMetadata: state.entities.users,
  userWallets: state.entities.wallets,
  ...state.screens.communityEntities,
  ...getTransaction(state, state.screens.communityEntities.transactionHash),
  community: getCurrentCommunity(state),
  transactionData: getTransaction(state, state.screens.communityEntities.transactionHash)
})

const mapDispatchToProps = {
  push,
  joinCommunity,
  addEntity,
  addAdminRole,
  removeAdminRole,
  removeEntity,
  addMinter,
  loadModal,
  hideModal,
  importExistingEntity,
  fetchUsersMetadata
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(observer(Users)))