/* eslint multiline-ternary: ["error", "never"] */

import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import get from 'lodash/get'
import identity from 'lodash/identity'
import capitalize from 'lodash/capitalize'
import isEmpty from 'lodash/isEmpty'
import { toChecksumAddress } from 'web3-utils'
import MyTable from 'components/FuseDashboard/components/Table'
import {
  fetchEntityMetadata
} from 'actions/communityEntities'
import { loadModal } from 'actions/ui'
import { ADD_BUSINESS_MODAL } from 'constants/uiConstants'
import TransactionMessage from 'components/common/TransactionMessage'
import { isIpfsHash, isS3Hash } from 'utils/metadata'
import CopyToClipboard from 'components/common/CopyToClipboard'
import { addressShortener } from 'utils/format'
import { getBlockExplorerUrl } from 'utils/network'

import dotsIcon from 'images/dots.svg'
import AddBusiness from 'images/add_business.svg'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { autorun } from 'mobx'
import withTransaction from 'components/common/WithTransaction'
import { removeEntity, addBusiness, addBusinessRole, removeBusinessRole } from 'utils/community'

const BusinessesTable = withTransaction(
  ({
    isRequested,
    isPending,
    users,
    admins,
    tableData,
    handleSendTransaction,
    entityAdded,
    isAdmin,
    loadModal,
    makeRemoveEntityTransaction,
    makeAddBusinessTransaction,
    makeAddBusinessRoleTransaction,
    makeRemoveBusinessRoleTransaction
  }) => {
    const handleAddBusiness = () => loadAddBusinessModal()
    const [transactionTitle, setTransactionTitle] = useState()

    const checkIsUser = ({ account }) => users.some(u => u.address === account)
    const checkIsAdmin = ({ account }) => admins.some(u => u.address === account)

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
        Header: 'Type',
        accessor: 'type'
      },
      {
        Header: 'Address',
        accessor: 'address'
      },
      {
        Header: 'Account ID',
        accessor: 'account',
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
        id: 'dropdown',
        accessor: '',
        Cell: rowInfo => {
          return isAdmin ? (
            <div className='table__body__cell__more'>
              <div className='table__body__cell__more__toggler'>
                <img src={dotsIcon} />
              </div>
              <div className='more' onClick={e => e.stopPropagation()}>
                <ul className='more__options'>
                  <li
                    className='more__options__item'
                    onClick={() => {
                      debugger
                      if (checkIsAdmin(rowInfo.row.original)) {
                        handleSendTransaction(() => makeRemoveBusinessRoleTransaction(rowInfo.row.original.account))
                        setTransactionTitle('Removing business role from user')
                      } else {
                        handleSendTransaction(() =>
                          makeRemoveEntityTransaction(
                            rowInfo.row.original.account
                          )
                        )
                        setTransactionTitle('Removing the business from list')
                      }
                    }}
                  >
                    <FontAwesome name='trash' /> Remove from list
                  </li>
                </ul>
              </div>
            </div>
          ) : null
        }
      }
    ]

    const loadAddBusinessModal = () => {
      loadModal(ADD_BUSINESS_MODAL, {
        users,
        submitEntity: (...args) => {
          if (checkIsUser(...args)) {
            handleSendTransaction(() => makeAddBusinessRoleTransaction(...args))
            setTransactionTitle('Assigning user as business')
          } else {
            handleSendTransaction(() => makeAddBusinessTransaction(...args))
            setTransactionTitle('Adding business to list')
          }
        }
      })
    }

    const message = (
      <TransactionMessage
        title={transactionTitle}
        message={isRequested ? 'Please sign with your wallet' : 'Pending'}
        isOpen={isRequested || isPending}
        isDark
      />
    )
    if (!isEmpty(tableData)) {
      return (
        <>
          <MyTable
            addActionProps={{
              placeholder: 'Search a business',
              action: isAdmin ? handleAddBusiness : null,
              isAdmin,
              text: isAdmin ? 'Add business' : null,
              onChange: identity
              // TODO - search
              // onChange: setSearch
            }}
            columns={columns}
            data={tableData}
            justAdded={entityAdded}
            count={0}
            size={100}
          />
          {message}
        </>
      )
    } else {
      return (
        <div className='entities__empty-list'>
          <img src={AddBusiness} />
          <div className='entities__empty-list__title'>
            Add a business to your List!
          </div>
          <button
            className='entities__empty-list__btn'
            onClick={(...args) => {
              handleAddBusiness(...args)
              setTransactionTitle('Adding business to list')
            }}
          >
            Add business
          </button>
          {message}
        </div>
      )
    }
  }
)

const Businesses = ({
  loadModal,
  businessesMetadata,
  fetchEntityMetadata
}) => {
  const { dashboard } = useStore()
  const { communityBusinesses, communityUsers, communityAdmins, isAdmin } = dashboard
  const { address: communityAddress } = useParams()
  const [data, setData] = useState(null)
  const { network } = useStore()
  const { web3Context } = network
  const { tokenContext } = dashboard

  const handleConfirmation = () => {
    dashboard?.fetchCommunityBusinesses(communityAddress)
    // temp thegraph race condition hack
    setTimeout(() => {
      dashboard.fetchCommunityBusinesses(communityAddress)
    }, 2000)
  }

  useEffect(() => {
    dashboard.fetchCommunityBusinesses(communityAddress)
    dashboard.fetchCommunityUsers(communityAddress)
  }, [])

  useEffect(
    () =>
      autorun(() => {
        (communityBusinesses || []).forEach(({ address }) => {
          const checkSumAddress = toChecksumAddress(address)
          if (!businessesMetadata[checkSumAddress]) {
            fetchEntityMetadata(
              toChecksumAddress(communityAddress),
              toChecksumAddress(address)
            )
          }
        })
      }),
    [communityBusinesses]
  )

  useEffect(
    () =>
      autorun(() => {
        if (communityBusinesses) {
          const data = communityBusinesses.map(({ address }) => {
            const checkSumAddress = toChecksumAddress(address)
            const imageHash = get(businessesMetadata[checkSumAddress], 'image')
            const image = isIpfsHash(imageHash)
              ? `${CONFIG.ipfsProxy.urlBase}/image/${imageHash}`
              : isS3Hash(imageHash)
              ? `https://${CONFIG.aws.s3.bucket}.s3.amazonaws.com/${imageHash}`
              : ''
            return {
              name: [
                {
                  name: get(businessesMetadata[checkSumAddress], 'name', ''),
                  image: imageHash ? (
                    <div
                      style={{
                        backgroundImage: `url(${image}`,
                        width: '36px',
                        height: '36px',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                      }}
                    />
                  ) : (
                    <FontAwesome style={{ fontSize: '36px' }} name='bullseye' />
                  )
                }
              ],
              type: capitalize(
                get(businessesMetadata[checkSumAddress], 'type', '')
              ),
              address: capitalize(
                get(businessesMetadata[checkSumAddress], 'address', '')
              ),
              account: address
            }
          })
          setData(data)
        }
        return () => {}
      }),
    [communityBusinesses, businessesMetadata]
  )

  const tableData = useMemo(() => data || [], [data])

  const makeAddBusinessTransaction = metadata => {
    const businessAccountAddress = metadata.account
    return addBusiness(
      { communityAddress, businessAccountAddress, metadata },
      web3Context, tokenContext
    )
  }

  const makeAddBusinessRoleTransaction = metadata => {
    const businessAccountAddress = metadata.account
    return addBusinessRole(
      { communityAddress, businessAccountAddress, metadata },
      web3Context, tokenContext
    )
  }

  const makeRemoveEntityTransaction = entityAccountAddress => {
    return removeEntity(
      { communityAddress, entityAccountAddress },
      web3Context
    )
  }

  const makeRemoveBusinessRoleTransaction = businessAccountAddress => {
    return removeBusinessRole(
      { communityAddress, businessAccountAddress },
      web3Context
    )
  }

  return (
    <>
      <div className='entities__header'>
        <h2 className='entities__header__title'>Business List</h2>
      </div>
      <div className='entities__wrapper'>
        <BusinessesTable
          desiredNetworkName='fuse'
          loadModal={loadModal}
          tableData={tableData}
          makeAddBusinessTransaction={makeAddBusinessTransaction}
          makeAddBusinessRoleTransaction={makeAddBusinessRoleTransaction}
          makeRemoveEntityTransaction={makeRemoveEntityTransaction}
          makeRemoveBusinessRoleTransaction={makeRemoveBusinessRoleTransaction}
          users={communityUsers}
          admins={communityAdmins}
          isAdmin={isAdmin}
          entityAdded
          onConfirmation={handleConfirmation}
        />
      </div>
    </>
  )
}

const mapStateToProps = state => ({
  businessesMetadata: state.entities.businesses
})

const mapDispatchToProps = {
  loadModal,
  fetchEntityMetadata
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(observer(Businesses))
