import React, {Component} from "react"
import { connect } from 'react-redux'
import { compose, withProps, withStateHandlers, withState, withHandlers } from "recompose"
import { mapStyle, googleMapsUrl } from '../constants/uiConstants'
import {
	withScriptjs,
	withGoogleMap,
	GoogleMap,
	OverlayView
} from "react-google-maps"
import classNames from 'classnames'

import Marker from 'components/Marker'

import { name, symbol, totalSupply, balanceOf, transfer, owner } from 'actions/basicToken'

const panByHorizontalOffset = 1.8 // because of the community sidebar

const getPixelPositionOffset = (width, height) => ({
	x: -(width / 2),
	y: -(height / 2),
})

const GoogleMapComponent = compose(
	withProps({
		googleMapURL: googleMapsUrl,
		loadingElement: <div style={{ height: `100%` }} />,
		containerElement: <div style={{ width: `100%`,  height: `100vh`  }} />,
		mapElement: <div style={{ height: `100%` }} />
	}),
	withScriptjs,
	withGoogleMap,
	withState('zoom', 'zoomIn', 4),
	withHandlers(() => {
		const refs = {map: undefined}

		return {
			onMapMounted: () => ref => {
				refs.map = ref
			},
			onClick: ({zoomIn}) => () => {
				let n = 5
				refs.map.panTo({lat: 32.0852, lng: 34.7817 + panByHorizontalOffset})
				zoomIn(n)
				setTimeout(() => {zoomIn(n + 1)}, 150)
				setTimeout(() => {zoomIn(n + 2)}, 300)
				setTimeout(() => {zoomIn(n + 3)}, 450)
			}
		}
	})
)(props => (
	<GoogleMap
		defaultZoom={4}
		defaultCenter={{ lat:34.0507729, lng: 32.75446020000004}}
		defaultOptions={{styles: mapStyle, disableDefaultUI: true}}
		ref={props.onMapMounted}
		zoom={props.zoom || 4}>

		<OverlayView position={{ lat: 32.0852, lng: 34.7817 }} 
			mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
			<Marker community={{name: props.name, price: '0.9CLN'}} onClick={props.onClick}/>
		</OverlayView>
		<OverlayView position={{ lat: 32.7940, lng: 34.9895 }} 
			mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
			<Marker community={{name: 'Haifa Coin', price: '0.8CLN'}}/>
		</OverlayView>
		<OverlayView position={{ lat: 51.5073, lng: -0.1277 }} 
			mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
			<Marker community={{name: 'London Coin', price: '0.7CLN'}}/>
		</OverlayView>
		<OverlayView position={{ lat: 53.4083, lng: -2.9915 }} 
			mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
			<Marker community={{name: 'Liverpool Coin', price: '0.6CLN'}}/>
		</OverlayView>
	</GoogleMap>
));

class MapComponent extends Component {
	render() {
		let mapWrapperClass = classNames({
			"active": this.props.active,
			"map-wrapper": true
		})
		console.log("PROPS", this.props)
		return (
			<div className={mapWrapperClass} >
				<GoogleMapComponent props={this.props} />
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		tokens: state.tokens
	}
}

export default connect(
  mapStateToProps
)(MapComponent)