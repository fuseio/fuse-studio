import React, { Fragment, useEffect, useState, useMemo } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect, useSelector } from 'react-redux'
import { getAccountAddress } from 'selectors/accounts'
import { getBusinessesEntities } from 'selectors/entities'
import {
  addEntity,
  fetchBusinessesEntities,
  removeEntity,
  joinCommunity
} from 'actions/communityEntities'
import { loadModal, hideModal } from 'actions/ui'
import { ADD_BUSINESS_MODAL, ENTITY_ADDED_MODAL } from 'constants/uiConstants'
import { getTransaction } from 'selectors/transaction'
import MyTable from 'components/dashboard/components/Table'
import AddBusiness from 'images/add_business.svg'
import { useFetch } from 'hooks/useFetch'
import { getApiRoot } from 'utils/network'
import isEmpty from 'lodash/isEmpty'
import sortBy from 'lodash/sortBy'
import { getForeignNetwork } from 'selectors/network'
import get from 'lodash/get'
import capitalize from 'lodash/capitalize'
import useSwitchNetwork from 'hooks/useSwitchNetwork'

const Businesses = ({
  networkType,
  businesses,
  community,
  isAdmin,
  fetchEntities,
  accountAddress,
  entityAdded,
  onlyOnFuse,
  fetchBusinessesEntities,
  loadModal,
  addEntity,
  joinCommunity,
  metadata,
  removeEntity
}) => {
  useSwitchNetwork(networkType, 'business list')
  const { communityAddress, isClosed } = community
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
      setData(sortBy(listData.map(({ profile, account, uri }) => {
        return {
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
                    : <FontAwesome style={{ fontSize: '36px' }} name='bullseye' />
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
                    : <FontAwesome style={{ fontSize: '36px' }} name='bullseye' />
                }
              ]
            : [
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
          name: !isEmpty(data) ? data[0].name[0].name : ''
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
              <div className='table__body__cell__more__toggler'><FontAwesome name='ellipsis-v' /></div>
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

  const handleAddBusiness = () => onlyOnFuse(loadAddBusinessModal)

  const handleJoinCommunity = () =>
    onlyOnFuse(() => loadAddBusinessModal(true))

  const loadAddBusinessModal = (isJoin) => {
    const submitEntity = isJoin ? joinCommunity : addEntity
    loadModal(ADD_BUSINESS_MODAL, {
      isJoin,
      entity: isJoin ? { account: accountAddress } : undefined,
      submitEntity: (data) => submitEntity(communityAddress, { ...data }, isClosed, 'business')
    })
  }

  const handleRemoveEntity = (account) =>
    onlyOnFuse(() => removeEntity(communityAddress, account))

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
  metadata: state.entities.metadata
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
