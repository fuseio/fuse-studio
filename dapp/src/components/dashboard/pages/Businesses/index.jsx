import React, { Fragment, useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import get from 'lodash/get'
import capitalize from 'lodash/capitalize'
import { toChecksumAddress } from 'web3-utils'
import gql from 'graphql-tag'
import { useLazyQuery } from '@apollo/react-hooks'
import MyTable from 'components/dashboard/components/Table'
import {
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
import { checkIsAdmin, getCommunityAddress } from 'selectors/entities'
import TransactionMessage from 'components/common/TransactionMessage'

import dotsIcon from 'images/dots.svg'

const GET_COMMUNITY = (address) => {
  return gql`
  {
    communities (where: {address: "${address}"}) {
      entitiesList {
        id
        communityEntities {
          address
          isAdmin
          isApproved
          isUser
          isBusiness
        }
      }
    }
  }
`
}

const Businesses = ({
  isClosed,
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
  showTransactionMessage
}) => {
  const { address: communityAddress } = useParams()
  const [data, setData] = useState(null)
  const [businesses, setBusinesses] = useState()
  const [users, setUsers] = useState([])

  const [fetchEntitiesFromGraph, { loading }] = useLazyQuery(GET_COMMUNITY(communityAddress), {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      const communityEntities = get(data, 'communities[0].entitiesList.communityEntities', [])
      const businesses = communityEntities.filter(entity => entity.isBusiness)
      const users = communityEntities.filter(entity => !entity.isBusiness)

      businesses.forEach(({ address }) => {
        fetchEntityMetadata(toChecksumAddress(communityAddress), toChecksumAddress(address))
      })
      setBusinesses(businesses)
      setUsers(users)
    }
  })

  const [transcactionTitle, setTransactionTitle] = useState()

  useEffect(() => {
    fetchEntitiesFromGraph()
  }, [])

  useEffect(() => {
    if (updateEntities) {
      setTimeout(() => {
        fetchEntitiesFromGraph()
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
    return () => { }
  }, [entityAdded])

  useEffect(() => {
    if (businesses) {
      const data = businesses.map(({ address }) => {
        const checkSumAddress = toChecksumAddress(address)
        return {
          name: [
            {
              name: get(businessesMetadata[checkSumAddress], 'name', ''),
              image: get(businessesMetadata[checkSumAddress], 'image')
                ? <div
                  style={{
                    backgroundImage: `url(${CONFIG.ipfsProxy.urlBase}/image/${get(businessesMetadata[checkSumAddress], 'image')}`,
                    width: '36px',
                    height: '36px',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
                : <FontAwesome style={{ fontSize: '36px' }} name='bullseye' />
            }
          ],
          type: capitalize(get(businessesMetadata[checkSumAddress], 'type', '')),
          address: capitalize(get(businessesMetadata[checkSumAddress], 'address', '')),
          account: address
        }
      })
      setData(data)
    }
    return () => { }
  }, [businesses, businessesMetadata])

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
      Header: 'Type',
      accessor: 'type'
    },
    {
      Header: 'Address',
      accessor: 'address'
    },
    {
      Header: 'Account ID',
      accessor: 'account'
    },
    {
      id: 'dropdown',
      accessor: '',
      Cell: (rowInfo) => {
        return (
          isAdmin ? (
            <div className='table__body__cell__more'>
              <div className='table__body__cell__more__toggler'>
                <img src={dotsIcon} />
              </div>
              <div className='more' onClick={e => e.stopPropagation()}>
                <ul className='more__options'>
                  <li className='more__options__item' onClick={() => handleRemoveEntity(rowInfo.row.original.account)}>
                    <FontAwesome name='trash' /> Remove from list
                  </li>
                </ul>
              </div>
            </div>
          ) : null
        )
      }
    }
  ], [isAdmin])

  const tableData = useMemo(() => data || [], [data])

  const handleAddBusiness = () => loadAddBusinessModal(false)

  const handleJoinCommunity = () => loadAddBusinessModal(true)

  const handleRemoveEntity = (account) => {
    setTransactionTitle('Removing the business from list')
    removeEntity(account)
  }

  const loadAddBusinessModal = (isJoin) => {
    const submitEntity = isJoin ? joinCommunity : addEntity
    setTransactionTitle(isJoin ? 'Joining the list' : 'Adding business to list')
    loadModal(ADD_BUSINESS_MODAL, {
      isJoin,
      entity: isJoin ? { account: accountAddress } : undefined,
      users,
      submitEntity: (data) => submitEntity(communityAddress, { ...data }, isClosed, 'business')
    })
  }

  // TODO - multi-selection
  // const toggleRow = (rowData) => {
  //   const checkbox = data.find(({ account }) => account === rowData.account).checkbox
  //   data.find(({ account }) => account === rowData.account).checkbox = !checkbox
  //   setData([...data])
  // }

  const renderTable = () => {
    return (
      <MyTable
        addActionProps={{
          placeholder: 'Search a business',
          action: isAdmin ? handleAddBusiness : handleJoinCommunity,
          isAdmin,
          text: isAdmin ? 'Add business' : 'Join'
          // TODO - search
          // onChange: setSearch
        }}
        data={tableData}
        justAdded={entityAdded}
        loading={loading}
        columns={columns}
        pageCount={0}
        pageSize={50}
      />
    )
  }

  // const renderContent = () => {
  //   if (data && data.length) {
  //     return renderTable()
  //   } else {
  //     return (
  //       <div className='entities__empty-list'>
  //         <img src={AddBusiness} />
  //         <div className='entities__empty-list__title'>Add a business to your List!</div>
  //         <button
  //           className='entities__empty-list__btn'
  //           onClick={handleAddBusiness}
  //         >
  //           Add business
  //         </button>
  //       </div>
  //     )
  //   }
  // }

  return (
    <Fragment>
      <div className='entities__header'>
        <h2 className='entities__header__title'>Business List</h2>
      </div>
      <div className='entities__wrapper'>
        {renderTable()}
        <TransactionMessage
          title={transcactionTitle}
          message={signatureNeeded ? 'Please sign with your wallet' : 'Pending'}
          isOpen={showTransactionMessage}
          isDark
        />
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  network: state.network,
  communityEntitiesMetaData: state.entities.communityEntities,
  accountAddress: getAccountAddress(state),
  ...state.screens.communityEntities,
  ...getTransaction(state, state.screens.communityEntities.transactionHash),
  businessesMetadata: state.entities.businesses,
  isClosed: getCurrentCommunity(state, getCommunityAddress(state)) ? getCurrentCommunity(state, getCommunityAddress(state)).isClosed : false,
  isAdmin: checkIsAdmin(state),
  updateEntities: state.screens.communityEntities.updateEntities
})

const mapDispatchToProps = {
  addEntity,
  removeEntity,
  loadModal,
  hideModal,
  joinCommunity,
  fetchEntityMetadata
}

export default connect(mapStateToProps, mapDispatchToProps)(Businesses)
