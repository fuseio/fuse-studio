import React, { Fragment, useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router'
import FontAwesome from 'react-fontawesome'
import { connect, useSelector } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import sortBy from 'lodash/sortBy'
import get from 'lodash/get'
import capitalize from 'lodash/capitalize'
import MyTable from 'components/dashboard/components/Table'
import { useFetch } from 'hooks/useFetch'
import useSwitchNetwork from 'hooks/useSwitchNetwork'
import {
  addEntity,
  fetchBusinessesEntities,
  removeEntity,
  joinCommunity
} from 'actions/communityEntities'
import { loadModal, hideModal } from 'actions/ui'
import { ADD_BUSINESS_MODAL, ENTITY_ADDED_MODAL } from 'constants/uiConstants'
import { getTransaction } from 'selectors/transaction'
import { getApiRoot } from 'utils/network'

import { getForeignNetwork } from 'selectors/network'
import { getCurrentCommunity } from 'selectors/dashboard'
import { getAccountAddress } from 'selectors/accounts'
import { getBusinessesEntities, checkIsAdmin, getCommunityAddress } from 'selectors/entities'

import dotsIcon from 'images/dots.svg'
import AddBusiness from 'images/add_business.svg'

const Businesses = ({
  businesses,
  isClosed,
  isAdmin,
  fetchEntities,
  accountAddress,
  entityAdded,
  businessJustAdded,
  fetchBusinessesEntities,
  loadModal,
  addEntity,
  joinCommunity,
  metadata,
  removeEntity
}) => {
  const { address: communityAddress } = useParams()
  useSwitchNetwork('fuse', { featureName: 'business list' })
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const apiRoot = getApiRoot(useSelector(getForeignNetwork))
  let url = `${apiRoot}/entities/${communityAddress}?type=business`

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
    return () => {}
  }, [search, fetchEntities])

  useEffect(() => {
    if (communityAddress) {
      fetchBusinessesEntities(communityAddress)
    }
    return () => {}
  }, [communityAddress])

  useEffect(() => {
    if (!isEmpty(response)) {
      const { data: listData } = response
      setData(sortBy(listData.map(({ account, uri }) => {
        return {
          name: [
            {
              name: get(metadata[uri], 'name', ''),
              image: get(metadata[uri], 'image')
                ? <div
                  style={{
                    backgroundImage: `url(${CONFIG.ipfsProxy.urlBase}/image/${get(metadata[uri], 'image')}`,
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
          type: get(metadata[uri], 'type', '') ? capitalize(get(metadata[uri], 'type')) : '', // type: profile && profile.publicData ? capitalize(profile.publicData.type) : '',
          address: get(metadata[uri], 'address', '') ? capitalize(get(metadata[uri], 'address')) : '', // profile && profile.publicData ? profile.publicData.address : '',
          account
        }
      }), ['updatedAt']).reverse())
    }
    return () => {}
  }, [response, metadata])

  useEffect(() => {
    if (entityAdded) {
      setTimeout(() => {
        loadModal(ENTITY_ADDED_MODAL, {
          type: 'business',
          name: businessJustAdded
        })
      }, 2000)
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

  const handleAddBusiness = () => loadAddBusinessModal(false)

  const handleJoinCommunity = () => loadAddBusinessModal(true)

  const loadAddBusinessModal = (isJoin) => {
    const submitEntity = isJoin ? joinCommunity : addEntity
    loadModal(ADD_BUSINESS_MODAL, {
      isJoin,
      entity: isJoin ? { account: accountAddress } : undefined,
      submitEntity: (data) => submitEntity(communityAddress, { ...data }, isClosed, 'business')
    })
  }

  const handleRemoveEntity = (account) => removeEntity(account)

  // TODO - multi-selection
  // const toggleRow = (rowData) => {
  //   const checkbox = data.find(({ account }) => account === rowData.account).checkbox
  //   data.find(({ account }) => account === rowData.account).checkbox = !checkbox
  //   setData([...data])
  // }

  const renderTable = () => {
    if (!data) return null
    return (
      <MyTable
        addActionProps={{
          placeholder: 'Search a business',
          action: isAdmin ? handleAddBusiness : handleJoinCommunity,
          isAdmin,
          text: isAdmin ? 'Add business' : 'Join',
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
    if (businesses && businesses.length) {
      return renderTable()
    } else {
      return (
        <div className='entities__empty-list'>
          <img src={AddBusiness} />
          <div className='entities__empty-list__title'>Add a business to your List!</div>
          <button
            className='entities__empty-list__btn'
            onClick={handleAddBusiness}
          >
            Add business
          </button>
        </div>
      )
    }
  }

  return (
    <Fragment>
      <div className='entities__header'>
        <h2 className='entities__header__title'>Business List</h2>
      </div>
      <div className='entities__wrapper'>
        {renderContent()}
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  network: state.network,
  businesses: getBusinessesEntities(state),
  accountAddress: getAccountAddress(state),
  ...state.screens.communityEntities,
  ...getTransaction(state, state.screens.communityEntities.transactionHash),
  metadata: state.entities.metadata,
  isClosed: getCurrentCommunity(state, getCommunityAddress(state)) ? getCurrentCommunity(state, getCommunityAddress(state)).isClosed : false,
  isAdmin: checkIsAdmin(state)
})

const mapDispatchToProps = {
  addEntity,
  removeEntity,
  loadModal,
  hideModal,
  fetchBusinessesEntities,
  joinCommunity
}

export default connect(mapStateToProps, mapDispatchToProps)(Businesses)
