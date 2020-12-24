import React, { Fragment, useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import get from 'lodash/get'
import identity from 'lodash/identity'
import capitalize from 'lodash/capitalize'
import isEmpty from 'lodash/isEmpty'
import { toChecksumAddress } from 'web3-utils'
import MyTable from 'components/dashboard/components/Table'
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
import { checkIsAdmin } from 'selectors/entities'
import TransactionMessage from 'components/common/TransactionMessage'
import { isIpfsHash, isS3Hash } from 'utils/metadata'
import CopyToClipboard from 'components/common/CopyToClipboard'
import { addressShortener } from 'utils/format'
import { getBlockExplorerUrl } from 'utils/network'

import dotsIcon from 'images/dots.svg'
import AddBusiness from 'images/add_business.svg'
import withTransaction from 'components/common/WithTransaction'
import { observer } from 'mobx-react'
import { addBusiness, removeBusiness } from 'utils/community'
import { useStore } from 'store/mobx'

const BusinessesTable = withTransaction(
  ({
    transactionStatus,
    isRequested,
    isPending,
    users,
    tableData,
    handleSendTransaction,
    isAdmin,
    entityAdded,
    loadModal,
    makeRemoveBusinessTransaction,
    makeAddBusinessTransaction
  }) => {
    const handleAddBusiness = () => loadAddBusinessModal(false)
    const [transactionTitle, setTransactionTitle] = useState()

    const columns = useMemo(
      () => [
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
                          makeRemoveBusinessTransaction(rowInfo.row.original.account)
                          setTransactionTitle('Removing the business from list')
                        }
                      }
                    >
                      <FontAwesome name='trash' /> Remove from list
                    </li>
                  </ul>
                </div>
              </div>
            ) : null
          }
        }
      ],
      [isAdmin]
    )

    const loadAddBusinessModal = isJoin => {
      // const submitEntity = isJoin ? joinCommunity : addEntity
      // setTransactionTitle(isJoin ? 'Joining the list' : 'Adding business to list')
      loadModal(ADD_BUSINESS_MODAL, {
        isJoin,
        // entity: isJoin ? { account: accountAddress } : undefined,
        users,
        submitEntity: makeAddBusinessTransaction
      })
    }

    const message = (
      <TransactionMessage
        title={transactionTitle}
        message={isRequested ? 'Please sign with your wallet' : 'Pending'}
        isOpen={isRequested || !!transactionStatus}
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
  fetchEntities,
  isAdmin,
  accountAddress,
  entityAdded,
  businessJustAdded,
  loadModal,
  addEntity,
  joinCommunity,
  removeEntity,
  businessesMetadata,
  fetchEntityMetadata,
  updateEntities,
  signatureNeeded,
  showTransactionMessage,
  businessesAccounts,
  userAccounts,
  community
}) => {
  const communityEntities = get(community, 'communityEntities', {})
  const { address: communityAddress } = useParams()
  const [data, setData] = useState(null)
  const [businesses, setBusinesses] = useState()
  const [users, setUsers] = useState([])
  const { network, _web3 } = useStore()
  const { web3Context } = network
  console.log(web3Context)

  useEffect(() => {
    fetchEntities(communityAddress)
  }, [])

  useEffect(() => {
    businessesAccounts.forEach(address => {
      const checkSumAddress = toChecksumAddress(address)
      if (!businessesMetadata[checkSumAddress]) {
        fetchEntityMetadata(
          toChecksumAddress(communityAddress),
          toChecksumAddress(address)
        )
      }
    })
    const businessEntities = businessesAccounts.map(
      account => communityEntities[account]
    )
    const userEntities = userAccounts
      .map(account => communityEntities[account])
      .filter(entity => !entity.isBusiness)

    setBusinesses(businessEntities)
    setUsers(userEntities)
  }, [businessesAccounts])

  useEffect(() => {
    if (updateEntities) {
      setTimeout(() => {
        fetchEntities(communityAddress)
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

  useEffect(() => {
    if (businesses) {
      const data = businesses.map(({ address }) => {
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
  }, [businesses, businessesMetadata])

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
          // columns={columns}
          // sendTransaction={makeAddBusinessTransaction}
          makeAddBusinessTransaction={makeAddBusinessTransaction}
          makeRemoveBusinessTransaction={makeRemoveBusinessTransaction}
          users={users}
          isAdmin={true}
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
  isAdmin: checkIsAdmin(state),
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
