import React, { Fragment, useEffect, useState, useMemo } from 'react'
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
  fetchEntities,
  addEntity,
  removeEntity,
  joinCommunity,
  fetchEntityMetadata
} from 'actions/communityEntities'
import { loadModal, hideModal } from 'actions/ui'
import { ADD_BUSINESS_MODAL, ENTITY_ADDED_MODAL } from 'constants/uiConstants'
import { getTransaction } from 'selectors/transaction'

import { getCurrentCommunity } from 'selectors/dashboard'
import { getAccountAddress } from 'selectors/accounts'
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
import { removeBusiness, addBusiness } from 'utils/community'

const BusinessesTable = withTransaction(
  ({
    isRequested,
    isPending,
    users,
    tableData,
    handleSendTransaction,
    entityAdded,
    isAdmin,
    loadModal,
    makeRemoveBusinessTransaction,
    makeAddBusinessTransaction
  }) => {
    const handleAddBusiness = () => loadAddBusinessModal()
    const [transactionTitle, setTransactionTitle] = useState()

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
          <React.Fragment>
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
          </React.Fragment>
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
                      handleSendTransaction(() =>
                        makeRemoveBusinessTransaction(
                          rowInfo.row.original.account
                        )
                      )
                      setTransactionTitle('Removing the business from list')
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
          handleSendTransaction(() => makeAddBusinessTransaction(...args))
          setTransactionTitle('Adding business to list')
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
  entityAdded,
  businessJustAdded,
  loadModal,
  businessesMetadata,
  fetchEntityMetadata,
  updateEntities,
}) => {
  const { dashboard } = useStore()
  const { community, communityBusinesses, isAdmin } = dashboard
  const { address: communityAddress } = useParams()
  const [data, setData] = useState(null)
  const [users, setUsers] = useState([])
  const { network, _web3 } = useStore()
  const { web3Context } = network

  useEffect(() => {
    dashboard.fetchCommunityBusinesses(communityAddress)
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

  useEffect(() => {
    if (updateEntities) {
      setTimeout(() => {
        dashboard.fetchCommunityBusinesses(communityAddress)
      }, 2000)
    }
  }, [updateEntities])

  useEffect(() => {
    if (entityAdded) {
      setTimeout(() => {
        loadModal(ENTITY_ADDED_MODAL, {
          type: 'business',
          name: businessJustAdded
        })
      }, 2500)
    }
    return () => {}
  }, [entityAdded])

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

  const makeAddBusinessTransaction = data => {
    const businessAccountAddress = data.account
    return addBusiness(
      { communityAddress, businessAccountAddress, metadata: data },
      web3Context
    )
  }

  const makeRemoveBusinessTransaction = account => {
    console.log(web3Context)
    console.log(_web3)

    return removeBusiness(
      { communityAddress, businessAccountAddress: account },
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
          makeRemoveBusinessTransaction={makeRemoveBusinessTransaction}
          users={users}
          isAdmin={isAdmin}
          entityAdded
        />
      </div>
    </>
  )
}

const mapStateToProps = state => ({
  accountAddress: getAccountAddress(state),
  ...state.screens.communityEntities,
  ...getTransaction(state, state.screens.communityEntities.transactionHash),
  businessesMetadata: state.entities.businesses,
  updateEntities: state.screens.communityEntities.updateEntities,
  community: getCurrentCommunity(state)
})

const mapDispatchToProps = {
  addEntity,
  removeEntity,
  loadModal,
  hideModal,
  joinCommunity,
  fetchEntityMetadata,
  fetchEntities
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(observer(Businesses))
