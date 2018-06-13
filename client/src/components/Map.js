import React, {Component} from "react"
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { compose, withProps, withStateHandlers, withState, withHandlers, lifecycle } from "recompose"
import { mapStyle, googleMapsUrl } from '../constants/uiConstants'
import {
	withScriptjs,
	withGoogleMap,
	GoogleMap,
	OverlayView
} from "react-google-maps"
import classNames from 'classnames'
import { isBrowser, isMobile, BrowserView, MobileView } from "react-device-detect"
import Marker from 'components/Marker'
import * as uiActions from '../actions/ui'
import {getAddresses} from 'selectors/web3'
import {getSelectedCommunity, getCommunities} from 'selectors/basicToken'
import ReactGA from 'services/ga'

const panByHorizontalOffset = isMobile ? 0 : 1.4 // because of the community sidebar, so it's a bit off the center
const panByVerticalOffset = isMobile ? 0.8 : 0
const defaultZoom = isMobile ? 3 : 4
const defaultCenter = isMobile ? { lat: 41.9, lng: 15.49 } : { lat:44.0507729, lng: 32.75446020000004 }

const GoogleMapComponent = compose(
	withProps({
		googleMapURL: googleMapsUrl,
		loadingElement: <div style={{ height: `100%`, backgroundColor: 'rgb(36, 35, 52)' }} />,
		containerElement: <div style={{ width: `100%`,  height: `100%`, backgroundColor: 'rgb(36, 35, 52)'  }} />,
		mapElement: <div className="map-element" style={{ height: `100%`, backgroundColor: 'rgb(36, 35, 52)' }} />
	}),
	withScriptjs,
	withGoogleMap,
	withState('refs', 'setRefs', {}),
	lifecycle({
		componentWillReceiveProps(nextProps, nextState) {
			let currentCoinAdress = nextProps.selectedCommunity && nextProps.selectedCommunity.address
			let n = 5

			if (!nextProps.ui.activeMarker && nextProps !== this.props && (!this.props.ui.zoom || this.props.ui.zoom === defaultZoom ) && currentCoinAdress && nextProps.tokens[currentCoinAdress] && nextProps.tokens[currentCoinAdress].metadata) {
				nextProps.refs.map.panTo({lat: parseFloat(nextProps.tokens[currentCoinAdress].metadata.location.geo.lat) - panByVerticalOffset, lng: parseFloat(nextProps.tokens[currentCoinAdress].metadata.location.geo.lng) + panByHorizontalOffset})
				this.props.uiActions.zoomToMarker(n)
				setTimeout(() => {this.props.uiActions.zoomToMarker(n + 1)}, 200)
				setTimeout(() => {this.props.uiActions.zoomToMarker(n + 2)}, 400)
				setTimeout(() => {this.props.uiActions.zoomToMarker(n + 3)}, 550)

				this.props.uiActions.setActiveMarker(currentCoinAdress, nextProps.tokens[currentCoinAdress].metadata.location.geo)
			}
			// Pan to the chosen marker location
			if (nextProps !== this.props && nextProps.ui.zoom === n && nextProps.ui.activeMarker && nextProps.tokens[nextProps.ui.activeMarker].metadata) {
				this.props.refs.map.panTo({lat: parseFloat(nextProps.tokens[nextProps.ui.activeMarker].metadata.location.geo.lat) - panByVerticalOffset, lng: parseFloat(nextProps.tokens[nextProps.ui.activeMarker].metadata.location.geo.lng) + panByHorizontalOffset})
			}
			// Pan out to default center
			if (nextProps !== this.props && nextProps.ui.zoom === (n-1) && !nextProps.ui.activeMarker) {
				this.props.refs.map.panTo(defaultCenter)
			}
		}
	}),

	withHandlers(() => {
		return {
			onMapMounted: () => (props, ref) => {
				if (!props.refs.map) props.refs.map = ref
			},
			onClick: (props) => (community) => {
				let n = 5
				props.refs.map.panTo({lat: parseFloat(community.metadata.location.geo.lat) - panByVerticalOffset, lng: parseFloat(community.metadata.location.geo.lng) + panByHorizontalOffset})

				if (!props.selectedCommunity) {
					props.uiActions.zoomToMarker(n)
					setTimeout(() => {props.uiActions.zoomToMarker(n + 1)}, 150)
					setTimeout(() => {props.uiActions.zoomToMarker(n + 2)}, 300)
					setTimeout(() => {props.uiActions.zoomToMarker(n + 3)}, 450)
				}
				props.uiActions.setActiveMarker(community.address, community.metadata.location.geo)

				ReactGA.event({
					category: 'Map',
					action: 'Click',
					label: community.name
				})
			}
		}
	})
)(props => (
	<GoogleMap
		defaultCenter={defaultCenter}
		defaultOptions={{styles: mapStyle, disableDefaultUI: true, maxZoom: 8, minZoom: 3}}
		ref={props.onMapMounted.bind(this, props)}
		style={{backgroundColor: 'rgb(229, 227, 223)'}}
		zoom={props.zoomToMarker || props.ui.zoom || defaultZoom}>
		{
			props.communities.map(community => (
				<OverlayView position={community.metadata.location.geo}
					mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
					key={community.address}>
					<Marker
						id={community.address}
						community={community}
						onClick={props.onClick}/>
				</OverlayView>
			))
		}
	</GoogleMap>
))

class MapComponent extends Component {
	render() {
		let mapWrapperClass = classNames({
			"active": this.props.active,
			"map-wrapper": true
		})

		return (
			<div className={mapWrapperClass} >
				<GoogleMapComponent selectedCommunity={this.props.selectedCommunity} communities={this.props.communities} addresses={this.props.addresses} tokens={this.props.tokens} ui={this.props.ui} uiActions={this.props.uiActions}/>
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		tokens: state.tokens,
		addresses: getAddresses(state),
		communities: getCommunities(state),
		selectedCommunity: getSelectedCommunity(state),
		ui: state.ui
	}
}

const mapDispatchToProps = dispatch => {
    return {
        uiActions: bindActionCreators(uiActions, dispatch),
    }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MapComponent)
