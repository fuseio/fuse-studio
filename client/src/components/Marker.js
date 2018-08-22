import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isMobile } from 'react-device-detect'
import * as actions from '../actions/ui'
import ReactGA from 'services/ga'

function rnd (m, n) {
  m = parseInt(m)
  n = parseInt(n)
  return Math.floor(Math.random() * (n - m + 1)) + m
}

// to make the points show up in round area instead of square
const randRadiusCoords = ([x, y], size) => {
  const t = 2 * Math.PI * Math.random()
  const h = size * Math.random()
  return [
    x + h * Math.cos(t),
    y + h * Math.sin(t)
  ]
}

class MarkerSVG extends Component {
  state = {}
  componentWillReceiveProps (nextProps) {
    const { selectedTokenAddress, activeMarker, token } = this.props
    if ((nextProps.activeMarker !== activeMarker && nextProps.activeMarker === token.address) ||
      (nextProps.activeMarker && selectedTokenAddress === token.address && selectedTokenAddress === nextProps.activeMarker)) {
      this.setState({grow: true})
    }

    if (nextProps.activeMarker !== activeMarker && nextProps.activeMarker !== token.address) {
      this.setState({grow: false})
    }
  }
  shouldComponentUpdate (nextProps) {
    if (nextProps.selectedTokenAddress === this.props.selectedTokenAddress &&
      nextProps.activeMarker === this.props.activeMarker &&
      nextProps.token === this.props.token) {
      return false
    }
    return true
  }

  onClick () {
    const token = this.props.token

    this.props.setActiveMarker(this.props.token.address, token.metadata.location.geo)
    this.props.history.push(token.path)

    ReactGA.event({
      category: 'Map',
      action: 'Click',
      label: token.name
    })
  }

  render () {
    let bubblecount, bubblesize, limits, markerTransform, r, minBubbleSize, centerTransform
    let particles = []
    const currentCoin = this.props.token

    if (isMobile) {
      centerTransform = 11
      minBubbleSize = this.state.grow ? 20 : 70
      bubblecount = this.state.grow ? 7 : 7
      bubblesize = this.state.grow ? 30 : 80
      limits = this.state.grow ? 40 : 30
      markerTransform = this.state.grow ? 'translate(-12, -24)' : 'translate(-12, -14)'
    } else {
      minBubbleSize = 20
      centerTransform = 4
      bubblecount = this.state.grow ? 70 : 15
      bubblesize = this.state.grow ? 30 : 15
      limits = this.state.grow ? 40 : 10
      markerTransform = this.state.grow ? 'translate(-19, -22)' : 'translate(-4, -4)'
    }

    for (var i = 0; i <= bubblecount; i++) {
      const size = (rnd(minBubbleSize, bubblesize) / 25)
      const coords = randRadiusCoords([0.9 * limits / 2, 0.9 * limits / 2], limits / 2)

      if (i % 2 === 0) {
        particles.push(<circle className='particle'
          key={i}
          style={{animationDelay: (rnd(0, 30) / 10) + 's'}}
          fill='rgba(77, 217, 180, 0.7)'
          stroke='none'
          cx={coords[1]}
          cy={coords[0]}
          r={size}
        />)
      } else {
        particles.push(<circle className='particle2'
          key={i}
          style={{animationDelay: (rnd(0, 30) / 10) + 's'}}
          fill='rgba(154, 139, 255, 0.7)'
          stroke='none'
          cx={coords[1]}
          cy={coords[0]}
          r={size}
        />)
      }
    }

    if (this.state.grow) {
      r = '8px'
    } else if (!this.state.grow && !isMobile) {
      r = '2px'
    } else {
      r = '6px'
    }

    return (
      <g className='particles bubbles' transform={markerTransform} onClick={this.onClick.bind(this)}>
        <defs>
          <filter id='dropshadow' x='-42.3%' y='-42.3%' width='300%' height='300%'>
            <feGaussianBlur stdDeviation='3' result='coloredBlur' />
            <feMerge>
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>
        {particles}
        <circle className='central'
          style={{
            animationDelay: (rnd(0, 30) / 10) + 's',
            filter: 'url(#dropshadow)'
          }}
          fill='rgba(77, 217, 180, 0.9)'
          stroke='none'
          cx={this.state.grow ? 19 : centerTransform}
          cy={this.state.grow ? 19 : centerTransform}
          r={r}
        />
        {this.state.grow ? <image width={'16px'} x='11' y='11' xlinkHref={currentCoin.metadata && currentCoin.metadata.imageLink} /> : null}
      </g>
    )
  }
}

const mapStateToProps = state => {
  return {
    activeMarker: state.ui.activeMarker
  }
}

export default connect(
  mapStateToProps,
  actions
)(MarkerSVG)
