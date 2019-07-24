import React, { Fragment, useEffect, useState, useMemo } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import Loader from 'components/common/Loader'
import { getAccountAddress } from 'selectors/accounts'
import { REQUEST, PENDING } from 'actions/constants'
import { getUsersEntities } from 'selectors/entities'
import {
  addEntity,
  fetchUsersEntities,
  removeEntity,
  addAdminRole,
  removeAdminRole,
  confirmUser,
  joinCommunity,
  importExistingEntity
} from 'actions/communityEntities'
import { loadModal, hideModal } from 'actions/ui'
import { ADD_USER_MODAL, IMPORT_EXISTING_ENTITY } from 'constants/uiConstants'
import ReactGA from 'services/ga'
// import { isOwner } from 'utils/token'
import isEmpty from 'lodash/isEmpty'
import { getTransaction } from 'selectors/transaction'
import TableContainer from 'components/dashboard/components/TableContainer'
import AddBusiness from 'images/add_business.svg'
import { useFetch } from 'hooks/useFetch'
import { getApiRoot } from 'utils/network'
import sortBy from 'lodash/sortBy'

const Users = ({
  users,
  isAdmin,
  history,
  network,
  community,
  accountAddress,
  signatureNeeded,
  transactionStatus,
  onlyOnFuse,
  fetchEntities,
  fetchUsersEntities,
  importExistingEntity,
  loadModal,
  joinCommunity,
  addEntity,
  removeEntity,
  addAdminRole,
  removeAdminRole,
  confirmUser
}) => {
  const { communityAddress, isClosed } = community
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const apiRoot = getApiRoot(network.networkType === 'fuse' ? 'default' : network.networkType)
  let url = `${apiRoot}/entities/${communityAddress}?type=user`

  if (search) {
    url = `${url}&search=${search}`
  }

  const [response, loading, fetchData] = useFetch(url, { verb: 'get' })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (fetchEntities === false) {
      fetchData()
    }

    if (search) {
      fetchData()
    }
  }, [search, fetchEntities])

  useEffect(() => {
    if (communityAddress) {
      fetchUsersEntities(communityAddress)
    }
  }, [communityAddress])

  useEffect(() => {
    if (!isEmpty(response)) {
      const { data: listData } = response
      setData(sortBy(listData.map(({ profile, isAdmin, isApproved, account }, index) => ({
        isApproved,
        isAdmin,
        name: profile && profile.publicData
          ? profile.publicData.name
            ? profile.publicData.name
            : `${profile.publicData.firstName} ${profile.publicData.lastName}`
          : '',
        account,
        status: isAdmin
          ? 'Community admin'
          : isApproved
            ? 'Community user'
            : 'Pending user'
      })), ['updatedAt']).reverse())
    }
  }, [response])

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
      accessor: 'account'
    },
    {
      id: 'dropdown',
      accessor: '',
      Cell: (rowInfo) => {
        const { isApproved, isAdmin, account } = rowInfo.row.original
        return (
          <div className='table__body__cell__more'>
            <div className='table__body__cell__more__toggler'><FontAwesome name='ellipsis-v' /></div>
            <div className='more' onClick={e => e.stopPropagation()}>
              <ul className='more__options'>
                {
                  !isApproved && !isAdmin && (
                    <ul className='more__options'>
                      <li className='more__options__item' onClick={() => handleConfirmUser(account)}>Confirm</li>
                      <li className='more__options__item' onClick={() => handleAddAdminRole(account)}>Make admin</li>
                    </ul>
                  )
                }
                {
                  isAdmin && isApproved && (
                    <ul className='more__options'>
                      <li className='more__options__item' onClick={() => handleRemoveEntity(account)}>Remove</li>
                      <li className='more__options__item' onClick={() => handleRemoveAdminRole(account)}>Remove as admin</li>
                    </ul>
                  )
                }
                {
                  !isAdmin && isApproved && (
                    <ul className='more__options'>
                      <li className='more__options__item' onClick={() => handleRemoveEntity(account)}>Remove</li>
                      <li className='more__options__item' onClick={() => handleAddAdminRole(account)}>Make admin</li>
                    </ul>
                  )
                }
              </ul>
            </div>
          </div>
        )
      }
    }
  ], [])

  // const showProfile = (address, hash) => {
  //   history.push(`/view/directory/${address}/${hash}`)
  //   ReactGA.event({
  //     category: 'Directory',
  //     action: 'Click',
  //     label: 'directory'
  //   })
  // }

  // const handleJoinCommunity = () => {
  //   onlyOnFuse(() => loadAddUserModal(true))
  // }

  // const importExisting = () => {
  //   // const { loadModal, importExistingEntity, community: { communityAddress, isClosed }, onlyOnFuse } = props
  //   onlyOnFuse(() => loadModal(IMPORT_EXISTING_ENTITY, {
  //     submitEntity: (data) => importExistingEntity(data.account, communityAddress, isClosed)
  //   }))
  // }

  // const renderTransactionStatus = () => {
  //   if (signatureNeeded || transactionStatus === PENDING || fetchEntities) {
  //     return (
  //       <div className='entities__loader'>
  //         <Loader color='#3a3269' className='loader' />
  //       </div>
  //     )
  //   }
  // }

  const handleAddUser = () => onlyOnFuse(loadAddUserModal)

  const loadAddUserModal = (isJoin) => {
    const submitEntity = isJoin ? joinCommunity : addEntity
    loadModal(ADD_USER_MODAL, {
      entity: isJoin ? { account: accountAddress } : undefined,
      submitEntity: (data) => submitEntity(communityAddress, { ...data }, isClosed, 'user')
    })
  }

  const handleRemoveEntity = (account) =>
    onlyOnFuse(() => removeEntity(communityAddress, account))

  const handleAddAdminRole = (account) =>
    onlyOnFuse(() => addAdminRole(account))

  const handleRemoveAdminRole = (account) =>
    onlyOnFuse(() => removeAdminRole(account))

  const handleConfirmUser = (account) =>
    onlyOnFuse(() => confirmUser(account))

  const renderTable = () => {
    if (!data) return null
    return (
      <TableContainer
        addActionProps={{
          placeholder: 'Search a user',
          action: handleAddUser,
          isAdmin,
          text: 'Add user',
          onChange: setSearch
        }}
        data={data}
        loading={loading}
        columns={columns}
        pageCount={response && response.pageCount ? response.pageCount : 0}
      />
    )
  }

  const renderContent = () => {
    if (users && users.length) {
      return renderTable()
    } else {
      return (
        <div className='entities__empty-list'>
          <img src={AddBusiness} />
          <div className='entities__empty-list__title'>Add a user to your List!</div>
          <button
            className='entities__empty-list__btn'
            onClick={handleAddUser}
          >
            Add User
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
  network: state.network,
  users: getUsersEntities(state),
  accountAddress: getAccountAddress(state),
  ...state.screens.communityEntities,
  ...getTransaction(state, state.screens.communityEntities.transactionHash)
})

const mapDispatchToProps = {
  joinCommunity,
  addEntity,
  confirmUser,
  addAdminRole,
  removeAdminRole,
  removeEntity,
  loadModal,
  hideModal,
  fetchUsersEntities,
  importExistingEntity
}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
