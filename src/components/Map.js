import React, {Component} from "react"
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


const getPixelPositionOffset = (width, height) => ({
  x: -(width / 2),
  y: -(height / 2),
})


const MyMapComponent = compose(
	withProps({
		googleMapURL: googleMapsUrl,
		loadingElement: <div style={{ height: `100%` }} />,
		containerElement: <div style={{ width: `100%`,  height: `100vh`  }} />,
		mapElement: <div style={{ height: `100%` }} />
	}),
	withScriptjs,
	withGoogleMap,
	//withStateHandlers(() => ({
  	//  count: 0,
  	//}), {
  	//  onClick: ({ count }) => () => ({
  	//    count: count + 1,
  	//  })
  	//}),
  	withState('zoom', 'onZoomChange', 8),
  	withHandlers(() => {
  	  const refs = {
  	    map: undefined,
  	  }
	
  	  return {
  	    onMapMounted: () => ref => {
  	      refs.map = ref
  	    },
  	    onClick: () => () => {
  	    	console.log("here", refs.map)
  	      refs.map.panTo({lat: 25.0112183,lng: 121.52067570000001})
  	    }
  	  }
  	})
)(props => (
	<GoogleMap
		defaultZoom={4}
		defaultCenter={{ lat:34.0507729, lng: 32.75446020000004}}
		defaultOptions={{styles: mapStyle, disableDefaultUI: true}}
		ref={props.onMapMounted}
		>

		<OverlayView position={{ lat: 32.0852, lng: 34.7817 }} 
			mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
			>
			<Marker community={{name: 'Tel Aviv Coin', price: '0.9CLN'}}/>
    	</OverlayView>
    	<OverlayView position={{ lat: 32.7940, lng: 34.9895 }} 
			mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
			>
			<Marker community={{name: 'Haifa Coin', price: '0.8CLN'}}/>
    	</OverlayView>
    	<OverlayView position={{ lat: 51.5073, lng: -0.1277 }} 
			mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}

			>
			<Marker community={{name: 'London Coin', price: '0.7CLN'}}/>
    	</OverlayView>
    	<OverlayView position={{ lat: 53.4083, lng: -2.9915 }} 
			mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
			>
			<Marker community={{name: 'Liverpool Coin', price: '0.6CLN'}}/>
    	</OverlayView>
	</GoogleMap>
));

//getPixelPositionOffset={getPixelPositionOffset}

//<div style={{ background: `white`, border: `1px solid #ccc`, padding: 15 }}>
//      		  <h1>OverlayView</h1>
//      		  <button onClick={props.onClick} style={{ height: 60 }}>
//      		    I have been clicked {props.count} time{props.count > 1 ? `s` : ``}
//      		  </button>
//      		</div>
class MyFancyComponent extends Component {
	render() {
		let mapWrapperClass = classNames({
			"active": this.props.active,
			"map-wrapper": true
		})
  		return (
  			<div className={mapWrapperClass} >
  		  		<MyMapComponent />
  			</div>
  		)
  	}
}
export default MyFancyComponent