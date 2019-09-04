import React, { Fragment, useEffect, useState, useMemo } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect, useSelector } from 'react-redux'
import { getAccountAddress } from 'selectors/accounts'
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
import { ADD_USER_MODAL, ENTITY_ADDED_MODAL } from 'constants/uiConstants'
import isEmpty from 'lodash/isEmpty'
import { getTransaction } from 'selectors/transaction'
import MyTable from 'components/dashboard/components/Table'
import AddBusiness from 'images/add_business.svg'
import { useFetch } from 'hooks/useFetch'
import { getApiRoot } from 'utils/network'
import sortBy from 'lodash/sortBy'
import Avatar from 'images/avatar.svg'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import SwitchNetwork from 'components/common/SwitchNetwork'
import { getForeignNetwork } from 'selectors/network'

const Users = ({
  networkType,
  currentUrl,
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
  confirmUser,
  transactionData,
  entityAdded
}) => {
  const { communityAddress, isClosed } = community
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const apiRoot = getApiRoot(useSelector(getForeignNetwork))
  let url = `${apiRoot}/entities/${communityAddress}?type=user`

  if (search) {
    url = `${url}&search=${search}`
  }

  const [response, loading, fetchData] = useFetch(url, { verb: 'get' })

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
      setData(sortBy(listData.map(({ profile, isAdmin: hasAdminRole, isApproved, account }, index) => ({
        isApproved,
        hasAdminRole,
        name: profile && profile.publicData
          ? profile.publicData.name
            ? [
              {
                name: profile.publicData.name,
                image: profile.publicData &&
                  profile.publicData.image
                  ? <div
                    style={{
                      backgroundImage: `url(https://ipfs.infura.io/ipfs/${profile.publicData.image[0].contentUrl['/']})`,
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
                name: `${profile.publicData.firstName} ${profile.publicData.lastName}`,
                image: profile.publicData &&
                  profile.publicData.image
                  ? <div
                    style={{
                      backgroundImage: `url(https://ipfs.infura.io/ipfs/${profile.publicData.image[0].contentUrl['/']})`,
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
        account,
        status: hasAdminRole
          ? 'Community admin'
          : !isClosed
            ? 'Community user'
            : isApproved
              ? 'Community user'
              : 'Pending user'
      })), ['updatedAt']).reverse())
    }

    return () => { }
  }, [response])

  useEffect(() => {
    if (entityAdded) {
      setTimeout(() => {
        loadModal(ENTITY_ADDED_MODAL, {
          type: 'users',
          name: !isEmpty(data) ? data[0].name[0].name : ''
        })
      }, 1000)
    }
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
      accessor: 'account'
    },
    {
      id: 'dropdown',
      accessor: '',
      Cell: (rowInfo) => {
        const { isApproved, hasAdminRole, account } = rowInfo.row.original
        return (
          isAdmin ? (
            <div className='table__body__cell__more'>
              <div className='table__body__cell__more__toggler'><FontAwesome name='ellipsis-v' /></div>
              <div className='more' onClick={e => e.stopPropagation()}>
                <ul className='more__options'>
                  {
                    !isApproved && !hasAdminRole && (
                      <ul className='more__options'>
                        <li className='more__options__item' onClick={() => handleConfirmUser(account)}>Confirm</li>
                        <li className='more__options__item' onClick={() => handleAddAdminRole(account)}>Make admin</li>
                        <li className='more__options__item' onClick={() => handleRemoveEntity(account)}>Remove</li>
                      </ul>
                    )
                  }
                  {
                    hasAdminRole && isApproved && (
                      <ul className='more__options'>
                        <li className='more__options__item' onClick={() => handleRemoveEntity(account)}>Remove</li>
                        <Link className='more__options__item' to={`${currentUrl}/transfer/${account}`}>Transfer tokens to user</Link>
                        <li className='more__options__item' onClick={() => handleRemoveAdminRole(account)}>Remove as admin</li>
                      </ul>
                    )
                  }
                  {
                    !hasAdminRole && isApproved && (
                      <ul className='more__options'>
                        <li className='more__options__item' onClick={() => handleRemoveEntity(account)}>Remove</li>
                        <Link className='more__options__item' to={`${currentUrl}/transfer/${account}`}>Transfer tokens to user</Link>
                        <li className='more__options__item' onClick={() => handleAddAdminRole(account)}>Make admin</li>
                      </ul>
                    )
                  }
                </ul>
              </div>
            </div>
          ) : null
        )
      }
    }
  ], [isAdmin])

  // const showProfile = (address, hash) => {
  //   history.push(`/view/directory/${address}/${hash}`)
  //   ReactGA.event({
  //     category: 'Directory',
  //     action: 'Click',
  //     label: 'directory'
  //   })
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
      isJoin,
      entity: isJoin ? { account: accountAddress } : undefined,
      submitEntity: (data) => submitEntity(communityAddress, { ...data }, isClosed, 'user')
    })
  }

  const handleJoinCommunity = () =>
    onlyOnFuse(() => loadAddUserModal(true))

  const handleRemoveEntity = (account) =>
    onlyOnFuse(() => removeEntity(communityAddress, account))

  const handleAddAdminRole = (account) =>
    onlyOnFuse(() => addAdminRole(account))

  const handleRemoveAdminRole = (account) =>
    onlyOnFuse(() => removeAdminRole(account))

  const handleConfirmUser = (account) =>
    onlyOnFuse(() => confirmUser(account))

  const renderTable = () => {
    return (
      <MyTable
        addActionProps={{
          placeholder: 'Search a user',
          // action: isAdmin ? handleAddUser : handleJoinCommunity,
          isAdmin,
          // text: isAdmin ? 'Add user' : 'Join community',
          onChange: setSearch
        }}
        data={tableData}
        justAdded={entityAdded}
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
      <div className={classNames('entities__header', { 'entities__header--disabled': networkType !== 'fuse' })}>
        <h2 className='entities__header__title'>Users list</h2>
      </div>
      <div className={classNames('entities__wrapper', { 'entities--disabled': networkType !== 'fuse' })}>
        {renderContent()}
        {networkType !== 'fuse' && (
          <SwitchNetwork pluginName='users list' />
        )}
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state, { match: { url: currentUrl } }) => ({
  currentUrl,
  network: state.network,
  users: getUsersEntities(state),
  accountAddress: getAccountAddress(state),
  ...state.screens.communityEntities,
  transactionData: getTransaction(state, state.screens.communityEntities.transactionHash)
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
