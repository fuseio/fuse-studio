import React, { PureComponent, useEffect } from 'react'
import { useParams } from 'react-router'
import { connect } from 'react-redux'
import { joinCommunity } from 'actions/communityEntities'
import { WRONG_NETWORK_MODAL, QR_MODAL } from 'constants/uiConstants'
import { loadModal, hideModal } from 'actions/ui'
import { getTransaction } from 'selectors/transaction'
import Bridge from 'components/dashboard/components/Bridge'
import CommunityInfo from 'components/dashboard/components/CommunityInfo'
import FontAwesome from 'react-fontawesome'
import ReactTooltip from 'react-tooltip'
import Header from 'components/dashboard/components/Header'
import { push } from 'connected-react-router'
import { getForeignNetwork } from 'selectors/network'
import SignIn from 'components/common/SignIn'
import { getForeignTokenByCommunityAddress } from 'selectors/token'
import { getEntity, getCommunityAddress } from 'selectors/entities'
import { getTokenAddressOfByNetwork, getCurrentCommunity } from 'selectors/dashboard'
import { getAccountAddress } from 'selectors/accounts'

const Dashboard = (props) => {
  const {
    community,
    foreignToken,
    accountAddress,
    dashboard,
    metadata,
    networkType,
    tokenOfCommunityOnCurrentSide,
    userEntity,
    push,
    loadModal,
    // tokenNetworkType
  } = props
  const isAdmin = userEntity && userEntity.isAdmin
  const { address: communityAddress } = useParams()

  // useEffect(() => {
  //   if (tokenNetworkType && tokenNetworkType !=)
  // }, [networkType, tokenNetworkType])

  // const showHomePage = () => push('/')

  const loadQrModal = (value) => {
    loadModal(QR_MODAL, { value })
  }

  const handleJoinCommunity = () => {
    push(`${this.props.pathname}/users`)
    joinCommunity(communityAddress)
  }

  return (
    (community && foreignToken) ? <React.Fragment>
      <SignIn accountAddress={accountAddress} />
      <Header
        metadata={{
          ...metadata[foreignToken && foreignToken.tokenURI],
          ...metadata[community && community.communityURI]
        }}
        tokenAddress={foreignToken && foreignToken.tokenAddress}
        isClosed={community && community.isClosed}
        communityURI={community && community.communityURI}
        name={community && community.name}
        networkType={networkType}
        token={foreignToken}
        handleJoinCommunity={userEntity ? undefined : handleJoinCommunity}
      />
      <CommunityInfo
        tokensTotalSupplies={dashboard && dashboard.totalSupply}
        foreignToken={foreignToken}
        loadQrModal={loadQrModal}
        communityAddress={community && community.communityAddress}
        homeTokenAddress={dashboard && dashboard.homeTokenAddress}
        foreignTokenAddress={community && community.foreignTokenAddress}
      />
      {
        (community && community.foreignTokenAddress) && (
          <div className='content__bridge'>
            <h3 className='content__bridge__title'>Bridge <FontAwesome style={{ fontSize: '60%' }} data-tip data-for='bridge' name='info-circle' /></h3>
            <ReactTooltip className='tooltip__content' id='bridge' place='bottom' effect='solid'>
              <div>Use the bridge to move tokens to Fuse to add new functionality and faster and cheaper verification times. You can start by selecting an initial sum, sigining the transaction and wait for 2 confirmations. Then you can switch to the Fuse chain to see the coins on the other side. Click here to learn more about the bridge.</div>
            </ReactTooltip>
            <Bridge
              symbol={foreignToken && foreignToken.symbol}
              decimals={foreignToken && foreignToken.decimals}
              tokenName={community.name}
              isAdmin={isAdmin}
              homeTokenAddress={dashboard && dashboard.homeTokenAddress}
              foreignTokenAddress={community && community.foreignTokenAddress}
              community={{ ...community, homeTokenAddress: dashboard.homeTokenAddress }}
              accountAddress={accountAddress}
              communityAddress={community && community.communityAddress}
              tokenOfCommunityOnCurrentSide={tokenOfCommunityOnCurrentSide}
            />
          </div>
        )
      }
    </React.Fragment> : <div />
  )
}

// class Dashboard extends PureComponent {
//   state = {
//     transferMessage: false,
//     burnMessage: false,
//     mintMessage: false,
//     lastAction: {}
//   }

//   componentDidUpdate(prevProps) {
//     const { networkType, tokenNetworkType } = this.props
//     if ((!prevProps.tokenNetworkType && (prevProps.tokenNetworkType !== networkType)) && (networkType !== 'fuse')) {
//       const { loadModal } = this.props
//       loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: [tokenNetworkType], handleClose: this.showHomePage })
//     }
//   }

//   showHomePage = () => {
//     this.props.push('/')
//   }

//   loadQrModal = (value) => {
//     const { loadModal } = this.props
//     loadModal(QR_MODAL, { value })
//   }

//   handleJoinCommunity = () => {
//     this.props.push(`${this.props.pathname}/users`)
//     this.props.joinCommunity(this.props.community.communityAddress)
//   }

//   render() {
//     const {
//       community,
//       foreignToken,
//       accountAddress,
//       dashboard,
//       metadata,
//       networkType,
//       tokenOfCommunityOnCurrentSide,
//       userEntity
//     } = this.props
//     const isAdmin = userEntity && userEntity.isAdmin
//     // console.log({ ...community, homeTokenAddress: dashboard.homeTokenAddress })
//     // console.log({ homeTokenAddress: dashboard.homeTokenAddress })
//     return (
//       (community && foreignToken) ? <React.Fragment>
//         <SignIn accountAddress={accountAddress} />
//         <Header
//           metadata={{
//             ...metadata[foreignToken && foreignToken.tokenURI],
//             ...metadata[community && community.communityURI]
//           }}
//           tokenAddress={foreignToken && foreignToken.tokenAddress}
//           isClosed={community && community.isClosed}
//           communityURI={community && community.communityURI}
//           name={community && community.name}
//           networkType={networkType}
//           token={foreignToken}
//           handleJoinCommunity={userEntity ? undefined : this.handleJoinCommunity}
//         />
//         <CommunityInfo
//           tokensTotalSupplies={dashboard && dashboard.totalSupply}
//           foreignToken={foreignToken}
//           loadQrModal={this.loadQrModal}
//           communityAddress={community && community.communityAddress}
//           homeTokenAddress={dashboard && dashboard.homeTokenAddress}
//           foreignTokenAddress={community && community.foreignTokenAddress}
//         />
//         {
//           (community && community.foreignTokenAddress) && (
//             <div className='content__bridge'>
//               <h3 className='content__bridge__title'>Bridge <FontAwesome style={{ fontSize: '60%' }} data-tip data-for='bridge' name='info-circle' /></h3>
//               <ReactTooltip className='tooltip__content' id='bridge' place='bottom' effect='solid'>
//                 <div>Use the bridge to move tokens to Fuse to add new functionality and faster and cheaper verification times. You can start by selecting an initial sum, sigining the transaction and wait for 2 confirmations. Then you can switch to the Fuse chain to see the coins on the other side. Click here to learn more about the bridge.</div>
//               </ReactTooltip>
//               <Bridge
//                 symbol={foreignToken && foreignToken.symbol}
//                 decimals={foreignToken && foreignToken.decimals}
//                 tokenName={community.name}
//                 isAdmin={isAdmin}
//                 homeTokenAddress={dashboard && dashboard.homeTokenAddress}
//                 foreignTokenAddress={community && community.foreignTokenAddress}
//                 community={{ ...community, homeTokenAddress: dashboard.homeTokenAddress }}
//                 accountAddress={accountAddress}
//                 communityAddress={community && community.communityAddress}
//                 tokenOfCommunityOnCurrentSide={tokenOfCommunityOnCurrentSide}
//               />
//             </div>
//           )
//         }
//       </React.Fragment> : <div />
//     )
//   }
// }

const mapStateToProps = (state) => ({
  tokenNetworkType: getForeignNetwork(state),
  metadata: state.entities.metadata,
  userEntity: getEntity(state),
  tokenOfCommunityOnCurrentSide: getTokenAddressOfByNetwork(state, getCurrentCommunity(state)),
  accountAddress: getAccountAddress(state),
  foreignToken: getForeignTokenByCommunityAddress(state, getCommunityAddress(state)),
  dashboard: state.screens.dashboard,
  community: getCurrentCommunity(state),
  ...state.screens.token,
  ...getTransaction(state, state.screens.token.transactionHash),
  pathname: state.router.location.pathname
})

const mapDispatchToProps = {
  loadModal,
  hideModal,
  push,
  joinCommunity
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
