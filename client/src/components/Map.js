import React, {Component} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
	ComposableMap,
	ZoomableGlobe,
	Geographies,
	Markers,
	Marker,
	Geography
} from "utils/react-simple-maps"
import { Motion, spring } from "react-motion"
import classNames from 'classnames'
import { isBrowser, isMobile, BrowserView, MobileView } from 'react-device-detect'
import MarkerSVG from 'components/Marker'
import * as uiActions from 'actions/ui'
import { mapStyle, mapSettings } from 'constants/uiConstants'
import {getSelectedCommunity, getCommunitiesWithMetadata} from 'selectors/basicToken'

import ReactGA from 'services/ga'
import topo110 from 'topojson/110m.json'
import topo50 from 'topojson/50m.json'


const panByHorizontalOffset = isMobile ? 0 : 5 // because of the community sidebar, so it's a bit off the center
const defaultZoom = isMobile ? 3 : 4

const defaultCenter = isMobile ? { lat: 45.10, lng: 18.68 } : { lat: 45.8397, lng: 24.0297 + panByHorizontalOffset }
const startCenter = isMobile ? { lat: 41.9, lng: 15.49 } : { lat: 48.0507729, lng: -20.75446020000004 + panByHorizontalOffset }

const mapStyles = {
	width: '100%',
	height: '100%',
}

class MapComponent extends Component {
	state = {
		scrolling: false,
		zoom: isMobile ? 1.5 : 0.81,
		center: startCenter,
		movingCenter: startCenter,
		geography: topo110,
		strokeWidth: mapStyle.TOPO110_STROKE_WIDTH,
	}
	dist = 0
	componentWillReceiveProps(nextProps, nextState) {
		const currentCoinAdress = nextProps.selectedCommunity && nextProps.selectedCommunity.address
		// Start with active community
		if (!isMobile && !nextProps.ui.activeMarker && nextProps !== this.props && currentCoinAdress && nextProps.tokens[currentCoinAdress] && nextProps.tokens[currentCoinAdress].metadata && nextProps.tokens.finishedMostCalls) {
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
				zoom: isMobile ? mapSettings.CENTER_ZOOM_MOBILE : mapSettings.CENTER_ZOOM,
			})
		}

		// Pan to the chosen marker location
		if (!isMobile && nextProps !== this.props && nextProps.ui.activeMarker && nextProps.ui.activeMarker !== this.props.ui.activeMarker && nextProps.tokens[nextProps.ui.activeMarker].metadata) {
			this.setState({
				center: nextProps.tokens[nextProps.ui.activeMarker].metadata.location.geo,
				zoom: mapSettings.MAX_ZOOM,
				movingCenter: null,
				geography: topo110,
				strokeWidth: mapStyle.TOPO110_STROKE_WIDTH
			})
		}

		// Pan out to default center
		if (!isMobile && nextProps !== this.props && !nextProps.ui.activeMarker && nextProps.ui.activeMarker !== this.props.ui.activeMarker) {
			this.setState({
				center: defaultCenter,
				movingCenter: null,
				zoom: isMobile ? mapSettings.CENTER_ZOOM_MOBILE : mapSettings.CENTER_ZOOM,
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
		this.refs.mapWrapper.addEventListener("touchmove", this.handlePinch.bind(this))
		this.refs.mapWrapper.addEventListener("touchstart", this.handlePinchStart.bind(this))
		this.refs.mapWrapper.addEventListener("touchend", this.handlePinchEnd.bind(this))
	}

	componentWillUnmount() {
		this.refs.mapWrapper.removeEventListener('wheel', this.handleScrollRemove.bind(this))
		this.refs.mapWrapper.removeEventListener("touchmove", this.handleScrollRemove.bind(this))
		this.refs.mapWrapper.removeEventListener("touchstart", this.handleScrollRemove.bind(this))
		this.refs.mapWrapper.removeEventListener("touchend", this.handleScrollRemove.bind(this))
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

	handlePinch(e) {
		//e.stopPropagation()
		//e.preventDefault()
		const roundedZoom = Math.round(this.state.zoom * 10)/10
		if (e.touches.length > 1) {
			const dist = Math.hypot(
    			e.touches[0].pageX - e.touches[1].pageX,
    			e.touches[0].pageY - e.touches[1].pageY);
			const direction = dist - this.dist

			if (roundedZoom < mapSettings.MAX_ZOOM && roundedZoom > mapSettings.MIN_ZOOM) {
				this.setState({
					zoom: direction > 0 ? roundedZoom * mapSettings.ZOOM_STEPS : roundedZoom / mapSettings.ZOOM_STEPS
				})
			} else if (roundedZoom === mapSettings.MIN_ZOOM && direction > 0) {
				this.setState({
					zoom: roundedZoom * mapSettings.ZOOM_STEPS
				})
			} else if (roundedZoom === mapSettings.MAX_ZOOM && direction < 0) {
				this.setState({
					zoom: roundedZoom / mapSettings.ZOOM_STEPS
				})
			}
		}
	}

	handlePinchStart(e) {
		//e.stopPropagation()
		//e.preventDefault()
		if (e.touches.length > 1) {
			this.dist = Math.hypot(
    			e.touches[0].pageX - e.touches[1].pageX,
    			e.touches[0].pageY - e.touches[1].pageY)
		}
	}

	handlePinchEnd(e) {
		//e.stopPropagation()
		//e.preventDefault()
		if (e.touches.length > 1) {
			this.dist = 0
		}
	}

	handleMoveEnd(newCenter) {
	  this.setState({
	  	movingCenter: { lat: newCenter[1], lng: newCenter[0] - panByHorizontalOffset}
	  })
	}

	handleMoveStart(newCenter) {
	  this.setState({
	  	geography: topo110,
	  	strokeWidth: mapStyle.TOPO50_STROKE_WIDTH
	  })
	}

	onRest() {
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
			addresses,
			communities,
			history
		} = this.props

		const {
			center,
			zoom,
			movingCenter,
			strokeWidth,
			geography
		} = this.state

		const markers = communities && communities.map((community) => {
			return {
				coordinates: [
					community.metadata && community.metadata.location && community.metadata.location.geo && community.metadata.location.geo.lng,
					community.metadata && community.metadata.location && community.metadata.location.geo && community.metadata.location.geo.lat
				],
				currentCoinAdress: selectedCommunity && selectedCommunity.address,
				path: community.path,
				community
			}
		})

		return (
				<div className={mapWrapperClass} ref="mapWrapper">
				    <Motion
				      defaultStyle={{
				        x: startCenter.lng,
				        y: startCenter.lat,
				        zoom: isMobile ? 1.5 : 0.81
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
				          <ZoomableGlobe zoom={zoom} center={[x + panByHorizontalOffset, y]} onMoveEnd={this.handleMoveEnd.bind(this)} onMoveStart={this.handleMoveStart.bind(this)}>
				            <circle cx={400} cy={224} r={220} fill={mapStyle.WATER_COLOR} stroke={mapStyle.STROKE_COLOR}/>
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
				                    	  	fill: mapStyle.LAND_COLOR,
				                    	  	stroke: mapStyle.STROKE_COLOR,
				                    	    strokeWidth: strokeWidth,
				                    	    outline: "none"
				                    	},
				                    	hover: {
				                    		fill: mapStyle.LAND_COLOR,
				                    	  	stroke: mapStyle.STROKE_COLOR,
				                    	    strokeWidth: strokeWidth,
				                    	    outline: "none"
				                    	},
				                    	pressed: {
				                    		fill: mapStyle.LAND_COLOR,
				                    	  	stroke: mapStyle.STROKE_COLOR,
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
									path={marker.path}
									history={history}
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

const mapStateToProps = state => {
	return {
		tokens: state.tokens,
		communities: getCommunitiesWithMetadata(state),
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
