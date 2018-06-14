import React, {Component} from "react"
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
	ComposableMap,
	ZoomableGlobe,
	Geographies,
	Markers,
	Marker,
	Geography
} from "react-simple-maps"
import { Motion, spring } from "react-motion"
import classNames from 'classnames'
import { isBrowser, isMobile, BrowserView, MobileView } from "react-device-detect"
import MarkerSVG from 'components/Marker'
import _ from 'lodash'
import * as uiActions from '../actions/ui'
import {getAddresses} from 'selectors/web3'
import {getSelectedCommunity} from 'selectors/basicToken'
import { pagePath, mapStyle, mapSettings } from 'constants/uiConstants'
import ReactGA from 'services/ga'
import topo110 from 'topojson/110m.json'
import topo50 from 'topojson/50m.json'


//const panByHorizontalOffset = isMobile ? 0 : 1.4 // because of the community sidebar, so it's a bit off the center
//const panByVerticalOffset = isMobile ? 0.8 : 0
const defaultZoom = isMobile ? 3 : 4
const defaultCenter = isMobile ? { lat: 49.8397, lng: 24.0297 } : { lat: 49.8397, lng: 24.0297 }
const startCenter = isMobile ? { lat: 41.9, lng: 15.49 } : { lat: 48.0507729, lng: -20.75446020000004 }

const mapStyles = {
	width: '100%',
	height: '100%'
}

class MapComponent extends Component {
	state = {
		scrolling: false,
		zoom: 1,
		center: startCenter,
		movingCenter: startCenter,
		geography: topo110,
		strokeWidth: mapStyle.TOPO110_STROKE_WIDTH
	}
	componentWillReceiveProps(nextProps, nextState) {
		const currentCoinAdress = nextProps.selectedCommunity && nextProps.selectedCommunity.address

		// Start with active community
		if (!nextProps.ui.activeMarker && nextProps !== this.props && currentCoinAdress && nextProps.tokens[currentCoinAdress] && nextProps.tokens[currentCoinAdress].metadata && nextProps.tokens.finishedMostCalls) {
			this.setState({
				center: nextProps.tokens[currentCoinAdress].metadata.location.geo,
				zoom: mapSettings.MAX_ZOOM,
				movingCenter: null
			})
			this.props.uiActions.setActiveMarker(currentCoinAdress, nextProps.tokens[currentCoinAdress].metadata.location.geo)
		}

		// Default clean main start
		if (!nextProps.ui.activeMarker && !currentCoinAdress && nextProps.tokens.finishedMostCalls) {
			this.setState({
				center: defaultCenter,
				movingCenter: null,
				zoom: mapSettings.CENTER_ZOOM,
			})
		}

		// Pan to the chosen marker location
		if (nextProps !== this.props && nextProps.ui.activeMarker && nextProps.ui.activeMarker !== this.props.ui.activeMarker && nextProps.tokens[nextProps.ui.activeMarker].metadata) {
			this.setState({
				center: nextProps.tokens[nextProps.ui.activeMarker].metadata.location.geo,
				zoom: mapSettings.MAX_ZOOM,
				movingCenter: null,
				geography: topo110,
				strokeWidth: mapStyle.TOPO110_STROKE_WIDTH
			})
		}
		
		// Pan out to default center
		if (nextProps !== this.props && !nextProps.ui.activeMarker && nextProps.ui.activeMarker !== this.props.ui.activeMarker) {
			this.setState({
				center: defaultCenter,
				movingCenter: null,
				zoom: mapSettings.CENTER_ZOOM,
				geography: topo110,
				strokeWidth: mapStyle.TOPO110_STROKE_WIDTH
			})
		}
	}
	componentWillUpdate(nextProps, nextState) {
		if (this.state.zoom > nextState.zoom && (this.state.zoom === mapSettings.MAX_ZOOM || this.state.zoom === mapSettings.MAX_ZOOM + 0.01)) {
			this.setState({
				geography: topo110,
				strokeWidth: mapStyle.TOPO110_STROKE_WIDTH
			})
		}		
	}
	componentDidMount() {
		this.refs.mapWrapper.addEventListener('wheel', this.handleScroll.bind(this))
	}

	componentWillUnmount() {
		this.refs.mapWrapper.removeEventListener('wheel', this.handleScrollRemove.bind(this))
	}

	handleScrollRemove(e) {
		e.stopPropagation()
		e.preventDefault()
	}

	handleScroll(e) {
		e.stopPropagation()
		e.preventDefault()
		const roundedZoom = Math.round(this.state.zoom * 10)/10

		if (roundedZoom < mapSettings.MAX_ZOOM && roundedZoom > mapSettings.MIN_ZOOM) {
			this.setState({
				zoom: e.deltaY > 0 ? roundedZoom * mapSettings.ZOOM_STEPS : roundedZoom / mapSettings.ZOOM_STEPS
			})
		} else if (roundedZoom === mapSettings.MIN_ZOOM && e.deltaY > 0) {
			this.setState({
				zoom: roundedZoom * mapSettings.ZOOM_STEPS
			})
		} else if (roundedZoom === mapSettings.MAX_ZOOM && e.deltaY < 0) {
			this.setState({
				zoom: roundedZoom / mapSettings.ZOOM_STEPS
			})
		}
	}
	
	handleMoveEnd(newCenter) {
	  this.setState({
	  	movingCenter: { lat: newCenter[1], lng: newCenter[0]}
	  })
	}

	handleMoveStart(newCenter) {
	  this.setState({
	  	geography: topo110,
	  	strokeWidth: mapStyle.TOPO50_STROKE_WIDTH
	  })
	}

	onRest() {
		console.log("this.state.zoom", this.state.zoom)
		if (this.state.zoom === mapSettings.MAX_ZOOM || this.state.zoom === mapSettings.MAX_ZOOM + 0.01) {
			this.setState({
				geography: topo50,
				strokeWidth: mapStyle.TOPO50_STROKE_WIDTH
			})
		} else {
			this.setState({
				geography: topo110,
				strokeWidth: mapStyle.TOPO110_STROKE_WIDTH
			})
		}		
	}

	render() {
		const mapWrapperClass = classNames({
			"active": this.props.active,
			"map-wrapper": true
		})
		const {
			tokens,
			selectedCommunity,
			addresses
		} = this.props

		const {
			center,
			zoom,
			movingCenter,
			strokeWidth,
			geography
		} = this.state

		const markers = [
  			{
  				coordinates: [
  					tokens[addresses.HaifaCoinAddress] &&
  					tokens[addresses.HaifaCoinAddress].metadata && 
  					tokens[addresses.HaifaCoinAddress].metadata.location &&
  					tokens[addresses.HaifaCoinAddress].metadata.location.geo &&
  					tokens[addresses.HaifaCoinAddress].metadata.location.geo.lng,
  					tokens[addresses.HaifaCoinAddress] &&
  					tokens[addresses.HaifaCoinAddress].metadata &&
  					tokens[addresses.HaifaCoinAddress].metadata.location &&
  					tokens[addresses.HaifaCoinAddress].metadata.location.geo &&
  					tokens[addresses.HaifaCoinAddress].metadata.location.geo.lat],
  				currentCoinAdress: selectedCommunity && selectedCommunity.address,
  				community: tokens[addresses.HaifaCoinAddress]
  			},
  			{
  				coordinates: [
  					tokens[addresses.TelAvivCoinAddress] &&
  					tokens[addresses.TelAvivCoinAddress].metadata && 
  					tokens[addresses.TelAvivCoinAddress].metadata.location &&
  					tokens[addresses.TelAvivCoinAddress].metadata.location.geo &&
  					tokens[addresses.TelAvivCoinAddress].metadata.location.geo.lng,
  					tokens[addresses.TelAvivCoinAddress] &&
  					tokens[addresses.TelAvivCoinAddress].metadata &&
  					tokens[addresses.TelAvivCoinAddress].metadata.location &&
  					tokens[addresses.TelAvivCoinAddress].metadata.location.geo &&
  					tokens[addresses.TelAvivCoinAddress].metadata.location.geo.lat],
  				currentCoinAdress: selectedCommunity && selectedCommunity.address,
  				community: tokens[addresses.TelAvivCoinAddress]
  			},
  			{
  				coordinates: [
  					tokens[addresses.LiverpoolCoinAddress] &&
  					tokens[addresses.LiverpoolCoinAddress].metadata && 
  					tokens[addresses.LiverpoolCoinAddress].metadata.location &&
  					tokens[addresses.LiverpoolCoinAddress].metadata.location.geo &&
  					tokens[addresses.LiverpoolCoinAddress].metadata.location.geo.lng,
  					tokens[addresses.LiverpoolCoinAddress] &&
  					tokens[addresses.LiverpoolCoinAddress].metadata &&
  					tokens[addresses.LiverpoolCoinAddress].metadata.location &&
  					tokens[addresses.LiverpoolCoinAddress].metadata.location.geo &&
  					tokens[addresses.LiverpoolCoinAddress].metadata.location.geo.lat],
  				currentCoinAdress: selectedCommunity && selectedCommunity.address,
  				community: tokens[addresses.LiverpoolCoinAddress]
  			},
		]

		//console.log("render")

		return (
			<div className={mapWrapperClass} ref="mapWrapper">
				    <Motion
				      defaultStyle={{
				        x: startCenter.lng,
				        y: startCenter.lat,
				        zoom: 1
				      }}
				      style={{
				        x: movingCenter && parseFloat(movingCenter.lng) || spring(parseFloat(center.lng), {stiffness: 184}),
				        y: movingCenter && parseFloat(movingCenter.lat) || spring(parseFloat(center.lat), {stiffness: 184}),
				        zoom: spring(zoom, {stiffness: 284})
				      }}
				      onRest={this.onRest.bind(this)}
				    >
				      {({ x, y, zoom }) => (
				        <ComposableMap
				          projection="orthographic"
				          projectionConfig={{ scale: 220 }}
				          style={mapStyles}
				        >
				          <ZoomableGlobe zoom={zoom} center={[x, y]} onMoveEnd={this.handleMoveEnd.bind(this)} onMoveStart={this.handleMoveStart.bind(this)}>
				            <circle cx={400} cy={224} r={220} fill="#241c4a" stroke="#393174"/>
				            <Geographies
				              disableOptimization
				              geography={geography}
				            >
				              {(geos, proj) =>
				                geos.map((geo, i) => (
				                  <Geography
				                    key={i}
				                    cacheId={null}
				                    geography={geo}
				                    projection={proj}
				                    style={{
				                    	default: {
				                    	  	fill: "#393174",
				                    	  	stroke: "#47399f",
				                    	    strokeWidth: strokeWidth,
				                    	    outline: "none"
				                    	},
				                    	hover: {
				                    		fill: "#393174",
				                    	  	stroke: "#47399f",
				                    	    strokeWidth: strokeWidth,
				                    	    outline: "none"
				                    	},
				                    	pressed: {
				                    		fill: "#393174",
				                    	  	stroke: "#47399f",
				                    	    strokeWidth: strokeWidth,
				                    	    outline: "none"
				                    	}
				                    }}
				                  />
				                ))
				              }
				            </Geographies>
				            <Markers>
				              {markers.map((marker, i) => (
				                <Marker
				                  key={i}
				                  marker={marker}
				                  style={{ hidden: { display: "none" }}}
				                  >
				                  <MarkerSVG 
									currentCoinAdress={marker.currentCoinAdress}
									pagePath={pagePath.haifa.path}
									community={marker.community}/>
				                </Marker>
				              ))}
				            </Markers>
				          </ZoomableGlobe>
				        </ComposableMap>
				      )}
				    </Motion>
			</div>
		)
	}
}
//<GoogleMapComponent selectedCommunity={this.props.selectedCommunity} addresses={this.props.addresses} tokens={this.props.tokens} ui={this.props.ui} uiActions={this.props.uiActions}/>

const mapStateToProps = state => {
	return {
		tokens: state.tokens,
		addresses: getAddresses(state),
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
