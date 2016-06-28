import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import find from 'lodash/find'

import { Checkerboard, Pin } from './icons'
import { EARTHS_RADIUS_IN_METERS } from './constants'
import { toRad, toDeg, first, last } from './utils'

const NullPoint = {
  distance: 0,
  bearing: 0,
  lat: 0,
  lng: 0
}

const findTourerStartingPoint = (distance, points) => (
  find(points, (point, index) => {
    const next = points[index + 1] || { distance: 0 }

    return (
      (distance > point.distance) &&
      (distance < next.distance)
    )
  }) || NullPoint
)

const calcTourerPosition = (distance, points) => {
  const firstPoint = first(points) || NullPoint
  const finalPoint = last(points) || NullPoint
  const routeTotal = finalPoint.distance

  if (distance <= 0) return firstPoint
  if (distance >= routeTotal) return finalPoint

  const startPoint = findTourerStartingPoint(distance, points)
  const currentBearingDistance = distance - startPoint.distance
  const lat = toRad(startPoint.lat) || 0
  const lng = toRad(startPoint.lng) || 0
  const bearing = toRad(startPoint.bearing) || 0
  const angularDistance = currentBearingDistance / EARTHS_RADIUS_IN_METERS

  const tourerLat = Math.asin(
    Math.sin(lat) * Math.cos(angularDistance) +
    Math.cos(lat) * Math.sin(angularDistance) *
    Math.cos(bearing)
  )
  const tourerLon = Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat),
    Math.cos(angularDistance) - Math.sin(lat) * Math.sin(tourerLat)
  ) + lng

  return {
    lat: toDeg(tourerLat),
    lng: toDeg(tourerLon)
  }
}

const defaultTourerIcon = {
  iconSize: L.point(30, 30),
  iconAnchor: [15, 30],
  className: '',
  html: renderToStaticMarkup(<Pin color='seagreen' />)
}

const defaultStartIcon = {
  iconSize: L.point(30, 30),
  className: '',
  html: renderToStaticMarkup(<Checkerboard color='seagreen' />)
}

const defaultFinishIcon = {
  iconSize: L.point(30, 30),
  className: '',
  html: renderToStaticMarkup(<Checkerboard />)
}

const defaultSegmentStyle = {
  color: '#7ec774'
}

class Map extends React.Component {
  shouldComponentUpdate () {
    return false
  }

  componentWillReceiveProps (nextProps) {
    const {
      routes = [],
      tourers = [],
      selected
    } = this.props

    const {
      routes: nextRoutes,
      tourers: nextTourers,
      selected: nextSelected,
      interactive = true
    } = nextProps

    if (interactive) {
      this._map.dragging.enable()
      this._map.touchZoom.enable()
      this._map.doubleClickZoom.enable()
      this._map.scrollWheelZoom.enable()
      this._map.keyboard.enable()
    } else {
      this._map.dragging.disable()
      this._map.touchZoom.disable()
      this._map.doubleClickZoom.disable()
      this._map.scrollWheelZoom.disable()
      this._map.keyboard.disable()
    }

    if (routes !== nextRoutes) {
      this.updateRoutes(nextRoutes, nextTourers)
    } else if (tourers !== nextTourers) {
      this.updateTourers(nextTourers)
    }

    if (nextSelected === null) {
      const tourer = find(this._tourers, (t) => t.id === selected)
      tourer && tourer.marker.closePopup()
    } else {
      const tourer = find(this._tourers, (t) => t.id === nextSelected)
      tourer && tourer.marker.openPopup()
    }
  }

  componentDidMount () {
    this._map = L.map(ReactDOM.findDOMNode(this))

    this._map.on('popupopen', this.handlePopupOpen.bind(this))

    this._startIcon = L.divIcon(defaultStartIcon)
    this._finishIcon = L.divIcon(defaultFinishIcon)

    this._markers = L.featureGroup()
    this._map.addLayer(this._markers)

    L.tileLayer(
      this.props.tileUrl,
      { attribution: this.props.tileAttribution }
    ).addTo(this._map)

    this._map.fitBounds([
      first((first(this.props.routes) || {}).waypoints),
      last((last(this.props.routes) || {}).waypoints)
    ], { padding: [50, 50] })

    if (this.props.routes.every((r) => (r.points || []).length)) {
      this.renderRoutes(this.props.routes)
      this.createTourers()
    }
  }

  openTourerPopup (marker) {
    const map = this._map
    const popup = marker.getPopup()
    const px = map.project(popup._latlng)
    px.y -= popup._container.clientHeight / 2
    map.panTo(map.unproject(px))
  }

  handlePopupOpen (e) {
    const marker = e.popup._source

    if (marker.tourer_id) {
      this.openTourerPopup(marker)
    }
  }

  handleMarkerClick (marker) {
    marker.openPopup()
    this.props.onSelection(marker.tourer_id)
  }

  iconForTourer ({ icon = defaultTourerIcon }) {
    return L.divIcon(icon)
  }

  updateTourer (tourer, points = []) {
    const { marker, popup = {}, distance } = tourer
    const point = calcTourerPosition(distance, points)
    const icon = this.iconForTourer(tourer)
    marker.setPopupContent(popup.content)
    marker.setLatLng(point)
    marker.setIcon(icon)
    marker.tourer_id = tourer.id

    return { ...tourer }
  }

  updateTourers (
    nextTourers = this.props.tourers,
    routes = this.props.routes
  ) {
    const points = routes.reduce((acc, route) => (
      acc.concat(route.points.map((p) => ({
        ...p,
        distance: p.distance + (last(acc) || { distance: 0 }).distance
      })))
    ), [])

    this._tourers = nextTourers.map((nextTourer) => {
      const existingTourer = find(this._tourers, (t) => t.id === nextTourer.id)
      if (!existingTourer) {
        return this.createTourer(nextTourer, points)
      } else {
        return this.updateTourer({
          ...existingTourer,
          ...nextTourer,
          marker: existingTourer.marker
        }, points)
      }
    })
  }

  createTourer (tourer = {}, points = []) {
    const { distance, popup } = tourer
    const point = calcTourerPosition(distance, points)
    const icon = this.iconForTourer(tourer)
    const marker = L.marker(point, { icon })

    if (popup) {
      marker.bindPopup(
        popup.content,
        popup.options
      )
    }

    marker.on('click', () => {
      this.handleMarkerClick(marker)
    })

    marker.tourer_id = tourer.id
    this._markers.addLayer(marker)

    return {
      ...tourer,
      marker
    }
  }

  createTourers () {
    const { tourers = [], routes = [] } = this.props
    const points = routes.reduce((acc, route) => (
      acc.concat(route.points.map((p) => ({
        ...p,
        distance: p.distance + (last(acc) || { distance: 0 }).distance
      })))
    ), [])

    this._tourers = tourers.map(
      (tourer) => this.createTourer(tourer, points)
    )
  }

  updateRoutes (routes, tourers) {
    this._routes && this._routes.forEach((segment) => (
      this._map.removeLayer(segment)
    ))
    this._startMarker && this._map.removeLayer(this._startMarker)
    this._finishMarker && this._map.removeLayer(this._finishMarker)
    this.renderRoutes(routes)
    this.updateTourers(tourers, routes)
  }

  renderStartAndFinish (start, finish) {
    this._startMarker = L.marker(start, { icon: this._startIcon }).addTo(this._map)
    this._finishMarker = L.marker(finish, { icon: this._finishIcon }).addTo(this._map)
  }

  renderRoutes (routes = []) {
    const firstPoint = first((first(routes) || {}).waypoints)
    const lastPoint = last((last(routes) || {}).waypoints)
    this._routes = routes.map(this.renderRouteSegment.bind(this))
    this.renderStartAndFinish(firstPoint, lastPoint)
    this._map.fitBounds([firstPoint, lastPoint], {
      padding: [50, 50]
    })
  }

  renderRouteSegment ({
    style = defaultSegmentStyle,
    points = []
  }) {
    return L.polyline(points, style).addTo(this._map)
  }

  render () {
    return <div style={{ width: '100%', height: '100%' }} />
  }
}

Map.propTypes = {
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      points: PropTypes.arrayOf(
        PropTypes.shape({
          x: PropTypes.number,
          y: PropTypes.number,
          bearing: PropTypes.number,
          distance: PropTypes.number
        })
      ),
      style: PropTypes.object
    })
  ),
  tourers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      distance: PropTypes.number.isRequired,
      popup: PropTypes.shape({
        content: PropTypes.string,
        options: PropTypes.object
      }),
      icon: PropTypes.shape({
        iconSize: PropTypes.arrayOf(PropTypes.number),
        className: PropTypes.string,
        html: PropTypes.string
      })
    })
  )
}

Map.defaultProps = {
  routes: [],
  tourers: [],
  onSelection: () => {},
  onTourerDeselection: () => {},
  tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.jpg',
  tileAttribution: '&copy; <a href="http://www.esri.com/">Esri</a>'
}

export default Map
