import React from "react"
import { compose, withProps, withStateHandlers, withState, withHandlers } from "recompose"
import { mapStyle, googleMapsUrl } from '../constants/uiConstants'
import {
	withScriptjs,
	withGoogleMap,
	GoogleMap,
	OverlayView
} from "react-google-maps"

import Marker from 'components/Marker'


const getPixelPositionOffset = (width, height) => ({
  x: -(width / 2),
  y: -(height / 2),
})


const MyMapComponent = compose(
	withProps({
		googleMapURL: googleMapsUrl,
		loadingElement: <div style={{ height: `100%` }} />,
		containerElement: <div style={{ height: `100vh`, width: `100%` }} />,
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
		defaultCenter={{ lat: 34.769132300000024, lng: 32.0825589 }}
		defaultOptions={{styles: mapStyle, disableDefaultUI: true}}
		ref={props.onMapMounted}
		>

		<OverlayView position={{ lat: 34.769132300000024, lng: 32.0825589 }} 
			mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
			getPixelPositionOffset={getPixelPositionOffset}>
			<Marker />
			
    	</OverlayView>
	</GoogleMap>
));

//<div style={{ background: `white`, border: `1px solid #ccc`, padding: 15 }}>
//      		  <h1>OverlayView</h1>
//      		  <button onClick={props.onClick} style={{ height: 60 }}>
//      		    I have been clicked {props.count} time{props.count > 1 ? `s` : ``}
//      		  </button>
//      		</div>

export default MyMapComponent