/* eslint multiline-ternary: ["error", "never"] */

import React, { useEffect, useState, useMemo } from 'react'
import { push } from 'connected-react-router'
import dotsIcon from 'images/dots.svg'
import isEmpty from 'lodash/isEmpty'
import { toChecksumAddress } from 'web3-utils'
import { useParams, withRouter } from 'react-router'
import { connect, useDispatch } from 'react-redux'
import sortBy from 'lodash/sortBy'
import identity from 'lodash/identity'
import MyTable from 'components/FuseDashboard/components/Table'
import TransactionMessage from 'components/common/TransactionMessage'
import CopyToClipboard from 'components/common/CopyToClipboard'
import FontAwesome from 'react-fontawesome'
import { addressShortener } from 'utils/format'
import { getBlockExplorerUrl } from 'utils/network'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { autorun } from 'mobx'
import {
  joinUser,
  addAdminRole,
  removeAdminRole,
  removeEntity
} from 'utils/community'

import { fetchUserNames } from 'actions/communityEntities'
import { loadModal } from 'actions/ui'
import { ADD_USER_MODAL } from 'constants/uiConstants'

import withTransaction from 'components/common/WithTransaction'

import AddBusiness from 'images/add_business.svg'
import Avatar from 'images/avatar.svg'

const UsersTable = withTransaction(
  ({
    tableData,
    isAdmin,
    communityAddress,
    handleSendTransaction,
    isRequested,
    isPending,
    toHandleJoin,
    web3Context
  }) => {
    const [transactionTitle, setTransactionTitle] = useState()
    const { accountAddress } = web3Context
    const dispatch = useDispatch()
    const { dashboard } = useStore()
    const { community } = dashboard

    const handleRemoveEntity = entityAccountAddress => {
      setTransactionTitle('Removing the user from list')
      handleSendTransaction(() => removeEntity({ communityAddress, entityAccountAddress }, web3Context))
    }

    const handleAddAdminRole = userAccountAddress => {
      setTransactionTitle('Assigning user as admin')
      handleSendTransaction(() => addAdminRole({ communityAddress, userAccountAddress }, web3Context))
    }

    const handleRemoveAdminRole = userAccountAddress => {
      setTransactionTitle('Depriving admin role from user')
      handleSendTransaction(() => removeAdminRole({ communityAddress, userAccountAddress }, web3Context))
    }

    const makeJoinUser = metadata => joinUser({ communityAddress, metadata }, web3Context)

    const handleTransfer = (address) => dispatch(push(`transfer/${address}`))

    useEffect(() => {
      if (toHandleJoin) {
        loadAddUserModal()
      }
    }, [toHandleJoin])

    const loadAddUserModal = () => {
      dispatch(loadModal(ADD_USER_MODAL, {
        isJoin: true,
        entity: { account: accountAddress },
        submitEntity: (...args) => {
          handleSendTransaction(() => makeJoinUser(...args))
        }
      }))
    }

    const columns = [
      {
        id: 'checkbox',
        accessor: '',
        Cell: rowInfo => {
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
          <>
            <a
              className='link'
              target='_blank'
              rel='noopener noreferrer'
              href={`${getBlockExplorerUrl('fuse')}/address/${value}`}
            >
              {addressShortener(value)}
            </a>
            <CopyToClipboard text={value}>
              <FontAwesome name='clone' />
            </CopyToClipboard>
          </>
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
        Cell: rowInfo => {
          const { hasAdminRole, address } = rowInfo.row.original
          return isAdmin ? (
            <div className='table__body__cell__more'>
              <div className='table__body__cell__more__toggler'>
                <img src={dotsIcon} />
              </div>
              <div className='more' onClick={e => e.stopPropagation()}>
                {!hasAdminRole && (
                  <ul className='more__options'>
                    <li
                      className='more__options__item'
                      onClick={() => handleAddAdminRole(address)}
                    >
                      Make admin
                    </li>
                    <li
                      className='more__options__item'
                      onClick={() => handleRemoveEntity(address)}
                    >
                      Remove
                    </li>
                    <li
                      className='more__options__item'
                      onClick={() => handleTransfer(address)}
                    >
                      Transfer tokens to user
                    </li>
                  </ul>
                )}
                {hasAdminRole && (
                  <ul className='more__options'>
                    {
                      accountAddress &&
                      accountAddress.toLowerCase() !==
                      address.toLowerCase() && (
                        <li
                          className='more__options__item'
                          onClick={() => handleRemoveEntity(address)}
                        >
                          Remove
                        </li>
                      )
                    }
                    {
                      accountAddress &&
                      accountAddress.toLowerCase() !==
                      address.toLowerCase() && (
                        <li
                          className='more__options__item'
                          onClick={() => handleRemoveAdminRole(address)}
                        >
                          Remove as admin
                        </li>
                      )
                    }
                    <li
                      className='more__options__item'
                      onClick={() => handleTransfer(address)}
                    >
                      Transfer tokens to user
                    </li>
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className='table__body__cell__more'>
              <div className='table__body__cell__more__toggler'>
                <img src={dotsIcon} />
              </div>
              <div className='more' onClick={e => e.stopPropagation()}>
                <ul className='more__options'>
                  <li
                    className='more__options__item'
                    onClick={() => handleTransfer(address)}
                  >
                    Transfer tokens to user
                  </li>
                </ul>
              </div>
            </div>
          )
        }
      }
    ]

    const message = (
      <TransactionMessage
        title={transactionTitle}
        message={isRequested ? 'Please sign with your wallet' : 'Pending'}
        isOpen={isRequested || isPending}
        isDark
      />
    )

    if (tableData && tableData.length > 0) {
      return (
        <>
          <MyTable
            addActionProps={{
              placeholder: 'Search a user',
              isAdmin,
              onChange: identity
            }}
            data={tableData}
            columns={columns}
            size={100}
          />
          {message}
        </>
      )
    } else {
      return (
        <div className='entities__empty-list'>
          <img src={AddBusiness} />
          <button
            className='entities__empty-list__btn'
            onClick={loadAddUserModal}
          >
            {`Join ${community && community.name}`}
          </button>
          {message}
        </div>
      )
    }
  }
)

const Users = ({
  usersMetadata,
  toHandleJoin
}) => {
  const { dashboard, network } = useStore()
  const { community, communityUsers, isAdmin } = dashboard
  const { web3Context } = network
  const dispatch = useDispatch()

  const { address: communityAddress } = useParams()
  const [data, setData] = useState([])

  const handleConfirmation = () => {
    dashboard?.fetchCommunityUsers(communityAddress)
    // temp thegraph race condition hack
    setTimeout(() => {
      dashboard.fetchCommunityUsers(communityAddress)
    }, 2000)
  }

  useEffect(() => {
    dashboard.fetchCommunityUsers(communityAddress)
  }, [])

  useEffect(
    () =>
      autorun(() => {
        if (communityUsers && communityUsers.length > 0) {
          dispatch(fetchUserNames(communityUsers.map(u => toChecksumAddress(u.address))))
        }
      }),
    [communityUsers]
  )

  useEffect(
    () =>
      autorun(() => {
        if (!isEmpty(communityUsers)) {
          const data = communityUsers
            .map(
              ({ isAdmin, isApproved, address, createdAt, displayName }) => {
                const metadata = usersMetadata[toChecksumAddress(address)]
                return {
                  isApproved,
                  hasAdminRole: isAdmin,
                  createdAt: new Date(createdAt * 1000),
                  name: metadata
                    ? [
                        {
                          name: metadata.name || metadata.displayName,
                          image: metadata.image ? (
                            <div
                              style={{
                                backgroundImage: `url(https://ipfs.infura.io/ipfs/${metadata.image.contentUrl['/']})`,
                                width: '36px',
                                height: '36px',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                backgroundImage: `url(${Avatar})`,
                                width: '36px',
                                height: '36px',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                              }}
                            />
                          )
                        }
                      ]
                    : [
                        {
                          name: displayName,
                          image: (
                            <div
                              style={{
                                backgroundImage: `url(${Avatar})`,
                                width: '36px',
                                height: '36px',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                              }}
                            />
                          )
                        }
                      ],
                  address,
                  status: isAdmin
                    ? 'Community admin'
                    : community && !community.isClosed
                    ? 'Community user'
                    : isApproved
                    ? 'Community user'
                    : 'Pending user'
                }
              })
          setData(sortBy(data, ['createdAt']).reverse())
        }

        return () => {}
      }),
    [communityUsers, usersMetadata]
  )

  const tableData = useMemo(() => data, [data])

  return (
    <>
      <div className='entities__header'>
        <h2 className='entities__header__title'>Users list</h2>
      </div>
      <div className='entities__wrapper'>
        <UsersTable
          desiredNetworkName='fuse'
          tableData={tableData}
          users={communityUsers}
          isAdmin={isAdmin}
          communityAddress={communityAddress}
          onConfirmation={handleConfirmation}
          toHandleJoin={toHandleJoin}
          web3Context={web3Context}
        />
      </div>
    </>
  )
}

const mapStateToProps = (state, { match }) => ({
  toHandleJoin: match.params.join,
  usersMetadata: state.entities.users
})

export default withRouter(
  connect(mapStateToProps, null)(observer(Users))
)
