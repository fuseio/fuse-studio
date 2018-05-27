import React, {Component} from "react"
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { compose, withProps, withStateHandlers, withState, withHandlers, lifecycle } from "recompose"
import { mapStyle, googleMapsUrl, pagePath } from '../constants/uiConstants'
import {
	withScriptjs,
	withGoogleMap,
	GoogleMap,
	OverlayView
} from "react-google-maps"
import classNames from 'classnames'
import { isBrowser, isMobile, BrowserView, MobileView } from "react-device-detect"
import addresses from '../constants/addresses'
import Marker from 'components/Marker'
import * as uiActions from '../actions/ui'

const panByHorizontalOffset = isMobile ? 0 : 1.4 // because of the community sidebar, so it's a bit off the center
const panByVerticalOffset = isMobile ? 0.8 : 0
const defaultZoom = isMobile ? 3 : 4
const defaultCenter = isMobile ? { lat: 41.9, lng: 15.49 } : { lat:44.0507729, lng: 32.75446020000004 }

const GoogleMapComponent = compose(
	withProps({
		googleMapURL: googleMapsUrl,
		loadingElement: <div style={{ height: `100%`, backgroundColor: 'rgb(36, 35, 52)' }} />,
		containerElement: <div style={{ width: `100%`,  height: `100vh`, backgroundColor: 'rgb(36, 35, 52)'  }} />,
		mapElement: <div className="map-element" style={{ height: `100%`, backgroundColor: 'rgb(36, 35, 52)' }} />
	}),
	withScriptjs,
	withGoogleMap,
	withState('refs', 'setRefs', {}),
	lifecycle({
		componentWillReceiveProps(nextProps, nextState) {
			let currentCoinAdress = this.props.currentCoinAdress
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
			if (nextProps !== this.props && nextProps.ui.zoom === 5 && nextProps.ui.activeMarker && nextProps.tokens[nextProps.ui.activeMarker].metadata) {
				this.props.refs.map.panTo({lat: parseFloat(nextProps.tokens[nextProps.ui.activeMarker].metadata.location.geo.lat) - panByVerticalOffset, lng: parseFloat(nextProps.tokens[nextProps.ui.activeMarker].metadata.location.geo.lng) + panByHorizontalOffset})
			}
			// Pan out to default center
			if (nextProps !== this.props && nextProps.ui.zoom === 4 && !nextProps.ui.activeMarker) {
				this.props.refs.map.panTo(defaultCenter)
			}
		}
	}),
	
	withHandlers(() => {
		return {
			onMapMounted: () => (props, ref) => {
				if (!props.refs.map) props.refs.map = ref
			},
			onClick: ({zoomIn}) => (location, coinAddress, uiActions, refs, currentCoinAdress) => {
				let n = 5
				refs.map.panTo({lat: parseFloat(location.lat) - panByVerticalOffset, lng: parseFloat(location.lng) + panByHorizontalOffset})
				
				if (!currentCoinAdress) {
					uiActions.zoomToMarker(n)
					setTimeout(() => {uiActions.zoomToMarker(n + 1)}, 150)
					setTimeout(() => {uiActions.zoomToMarker(n + 2)}, 300)
					setTimeout(() => {uiActions.zoomToMarker(n + 3)}, 450)
				}
				uiActions.setActiveMarker(coinAddress, location)
			}
		}
	})
)(props => (
	<GoogleMap
		defaultCenter={defaultCenter}
		defaultOptions={{styles: mapStyle, disableDefaultUI: true}}
		ref={props.onMapMounted.bind(this, props)}
		style={{backgroundColor: 'rgb(229, 227, 223)'}}
		zoom={props.zoomToMarker || props.ui.zoom || defaultZoom}>

		{ props.tokens && props.tokens[addresses.TelAvivCoinAddress] && props.tokens[addresses.TelAvivCoinAddress].metadata &&

			<OverlayView position={props.tokens[addresses.TelAvivCoinAddress].metadata.location.geo} 
				mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
				<Marker
					id={addresses.TelAvivCoinAddress}
					currentCoinAdress={props.currentCoinAdress}
					pagePath={pagePath.telaviv.path}
					community={{name: props.tokens[addresses.TelAvivCoinAddress].name, price: props.tokens[addresses.TelAvivCoinAddress].currentPrice}}
					onClick={props.onClick.bind(this, props.tokens[addresses.TelAvivCoinAddress].metadata.location.geo, addresses.TelAvivCoinAddress, props.uiActions, props.refs, props.currentCoinAdress)}/>
			</OverlayView>
		}

		{ props.tokens && props.tokens[addresses.HaifaCoinAddress] && props.tokens[addresses.HaifaCoinAddress].metadata &&
			<OverlayView position={props.tokens[addresses.HaifaCoinAddress].metadata.location.geo}
				mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
				<Marker
					id={addresses.HaifaCoinAddress}
					currentCoinAdress={props.currentCoinAdress}
					pagePath={pagePath.haifa.path}
					community={{name: props.tokens[addresses.HaifaCoinAddress].name, price: props.tokens[addresses.HaifaCoinAddress].currentPrice}}
					onClick={props.onClick.bind(this, props.tokens[addresses.HaifaCoinAddress].metadata.location.geo, addresses.HaifaCoinAddress, props.uiActions, props.refs, props.currentCoinAdress)}/>
			</OverlayView>
		}

		{ props.tokens && props.tokens[addresses.LondonCoinAddress] && props.tokens[addresses.LondonCoinAddress].metadata &&
			<OverlayView position={props.tokens[addresses.LondonCoinAddress].metadata.location.geo} 
				mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
				<Marker
					id={addresses.LondonCoinAddress}
					currentCoinAdress={props.currentCoinAdress}
					pagePath={pagePath.london.path}
					community={{name: props.tokens[addresses.LondonCoinAddress].name, price: props.tokens[addresses.LondonCoinAddress].currentPrice}}
					onClick={props.onClick.bind(this, props.tokens[addresses.LondonCoinAddress].metadata.location.geo, addresses.LondonCoinAddress, props.uiActions, props.refs, props.currentCoinAdress)}/>
			</OverlayView>
		}

		{ props.tokens && props.tokens[addresses.LiverpoolCoinAddress] && props.tokens[addresses.LiverpoolCoinAddress].metadata &&
			<OverlayView position={props.tokens[addresses.LiverpoolCoinAddress].metadata.location.geo}
				mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
				<Marker
					id={addresses.LiverpoolCoinAddress}
					currentCoinAdress={props.currentCoinAdress}
					pagePath={pagePath.liverpool.path}
					community={{name: props.tokens[addresses.LiverpoolCoinAddress].name, price: props.tokens[addresses.LiverpoolCoinAddress].currentPrice}}
					onClick={props.onClick.bind(this, props.tokens[addresses.LiverpoolCoinAddress].metadata.location.geo, addresses.LiverpoolCoinAddress, props.uiActions, props.refs, props.currentCoinAdress)}/>
			</OverlayView>
		}
	</GoogleMap>
));

class MapComponent extends Component {
	render() {
		let mapWrapperClass = classNames({
			"active": this.props.active,
			"map-wrapper": true
		})
		let currentCoinAdress

		pagePath && Object.values(pagePath) && Object.values(pagePath).forEach((page) => {
			if (page.path === this.props.currentRoute) {
				currentCoinAdress = page.address
				return
			}
		})

		return (
			<div className={mapWrapperClass} >
				nextProps.tokens[currentCoinAdress] && nextProps.tokens[currentCoinAdress].metadata ? <GoogleMapComponent tokens={this.props.tokens} ui={this.props.ui} uiActions={this.props.uiActions} currentCoinAdress={currentCoinAdress}/> : null
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		tokens: state.tokens,
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
