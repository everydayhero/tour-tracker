import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import find from 'lodash/find'
import forEach from 'lodash/forEach'

import { Checkerboard, Pin } from '../../icons'
import { EARTHS_RADIUS_IN_METERS } from '../../constants'
import { toRad, toDeg, first, last, calcBearing, calcDistance } from '../../utils'

const NullPoint = {
  distance: 0,
  lat: 0,
  lng: 0
}

const findTourerStartingPoint = (distance, { points }) => {
  let distanceFromCurrentPoint = distance

  for (let i = 0; i < points.length - 1; i++) {
    const segmentDistance = calcDistance(points[i], points[i + 1])

    if (distanceFromCurrentPoint < segmentDistance) {
      return {
        startPoint: points[i],
        nextPoint: points[i + 1],
        currentBearingDistance: distanceFromCurrentPoint
      }
    } else {
      distanceFromCurrentPoint -= segmentDistance
    }
  }

  return {
    startPoint: last(points),
    currentBearingDistance: 0
  }
}

const findTourersCurrentRoute = (distance, routes) => (
  find(routes, (route, index) => distance < (route.start + route.distance))
)

const calcTourerPosition = (distance, routes) => {
  const firstPoint = first((first(routes) || {}).points) || NullPoint
  const finalPoint = last((last(routes) || {}).points) || NullPoint
  const routeTotal = last(routes).start + last(routes).distance

  if (distance <= 0) return firstPoint
  if (distance >= routeTotal) return finalPoint

  const tourersCurrentRoute = findTourersCurrentRoute(distance, routes)
  const distanceIntoRoute = distance - tourersCurrentRoute.start
  const { startPoint, nextPoint, currentBearingDistance } = findTourerStartingPoint(distanceIntoRoute, tourersCurrentRoute)

  const lat = toRad(startPoint.lat) || 0
  const lng = toRad(startPoint.lng) || 0

  const bearing = startPoint && nextPoint ? toRad(calcBearing(startPoint, nextPoint)) : 0
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

const canRenderRoutes = (routes = []) => (
  routes.every((r) => (r.points || []).length)
)

const defaultTourerIcon = {
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  className: '',
  html: renderToStaticMarkup(<Pin color='seagreen' />)
}

const defaultWaypointIcon = {
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  className: '',
  html: renderToStaticMarkup(<Pin color='#0D2618' />)
}

const defaultStartIcon = {
  iconSize: [30, 30],
  className: '',
  html: renderToStaticMarkup(<Checkerboard color='seagreen' />)
}

const defaultFinishIcon = {
  iconSize: [30, 30],
  className: '',
  html: renderToStaticMarkup(<Checkerboard />)
}

const defaultSegmentStyle = {
  color: '#7ec774'
}

const defaultConnectorStyles = {
  color: '#333',
  opacity: 0.125
}

class Map extends React.Component {
  shouldComponentUpdate () {
    return false
  }

  componentWillReceiveProps (nextProps) {
    if (global.L) {
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

      if (routes !== nextRoutes && canRenderRoutes(nextRoutes)) {
        this.updateRoutes(nextRoutes, nextTourers)
      } else if (tourers !== nextTourers && canRenderRoutes(nextRoutes || routes)) {
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
  }

  componentDidMount () {
    if (global.L) {
      this._map = global.L.map(ReactDOM.findDOMNode(this))

      this._map.on('popupopen', this.handlePopupOpen.bind(this))

      this._startIcon = global.L.divIcon(this.props.startIcon)
      this._finishIcon = global.L.divIcon(this.props.finishIcon)

      this._markers = global.L.featureGroup()
      this._map.addLayer(this._markers)

      this._waypointMarkers = global.L.featureGroup()
      this._map.addLayer(this._waypointMarkers)

      global.L.tileLayer(
        this.props.tileUrl,
        { attribution: this.props.tileAttribution }
      ).addTo(this._map)

      if (this.props.focusMode !== 'selected') {
        this.focusOnRoute(this.props.routes)
      }

      if (canRenderRoutes(this.props.routes)) {
        this.renderRoutes(this.props.routes, this.props.focusMode !== 'selected')
        this.renderRouteConnections()
        this.createTourers()
      }

    }
  }

  focusOnRoute (routes) {
    const waypoints = routes.reduce((waypoints, route) => waypoints.concat(route.waypoints), [])
    this._map.fitBounds(waypoints, { padding: [50, 50] })
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
    return global.L.divIcon(icon)
  }

  focusOnTourer (point, zoom = 10) {
    this._map.fitBounds([
      point
    ], { maxZoom: zoom })
  }

  updateTourer (tourer, routes = [], selected, focusMode, zoom) {
    const { marker, popup = {}, distance } = tourer
    const point = calcTourerPosition(distance, routes)
    const icon = this.iconForTourer(tourer)
    marker.setPopupContent(popup.content)
    marker.setLatLng(point)
    marker.setIcon(icon)
    marker.tourer_id = tourer.id

    if (focusMode === 'selected' && tourer.id === selected) {
      this.focusOnTourer(point, zoom)
    }

    return { ...tourer }
  }

  updateTourers (
    nextTourers = this.props.tourers,
    routes = this.props.routes,
    selected = this.props.selected,
    focusMode = this.props.focusMode,
    zoom = this.props.zoom
  ) {
    const combinedRoutes = this.combineRoutes(routes)
    this._tourers = nextTourers.map((nextTourer) => {
      const existingTourer = find(this._tourers, (t) => t.id === nextTourer.id)
      if (!existingTourer) {
        return this.createTourer(nextTourer, combinedRoutes, selected, focusMode, zoom)
      } else {
        const tourer = {
          ...existingTourer,
          ...nextTourer,
          marker: existingTourer.marker
        }
        return this.updateTourer(tourer, combinedRoutes, selected, focusMode, zoom)
      }
    })
  }

  createTourer (tourer = {}, routes = [], selected, focusMode, zoom) {
    const { distance, popup } = tourer
    const point = calcTourerPosition(distance, routes)
    const icon = this.iconForTourer(tourer)
    const marker = global.L.marker(point, { icon })

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

    if (focusMode === 'selected' && tourer.id === selected) {
      this.focusOnTourer(point, zoom)
    }

    return {
      ...tourer,
      marker
    }
  }

  createTourers () {
    const { tourers = [], routes = [], selected, focusMode, zoom } = this.props
    const combinedRoutes = this.combineRoutes(routes)
    this._tourers = tourers.map(
      (tourer) => this.createTourer(tourer, combinedRoutes, selected, focusMode, zoom)
    )
  }

  combineRoutes (routes) {
    return routes.map((route, index) => {
      const prevRoutes = routes.slice(0, index)
      const prevTotal = prevRoutes.reduce((total, route) => total + route.distance, 0)
      return {
        ...route,
        start: prevTotal
      }
    })
  }

  renderWaypoints (routes = []) {
    this._waypoints = routes.reduce((arr, route) => {
      return arr.concat(route.waypoints.map(this.createWaypoint.bind(this)))
    }, [])

    this._map.addLayer(this._waypointMarkers)
  }

  createWaypoint (waypoint) {
    if (!waypoint.icon) {
      return waypoint
    }

    const icon = this.iconForWaypoint(waypoint)
    const marker = global.L.marker(waypoint, { icon })
    marker.waypoint_id = waypoint.id

    marker.on('click', () => {
      this.handleWaypointMarkerClick(marker)
    })

    this._waypointMarkers.addLayer(marker)

    return {
      ...waypoint,
      marker
    }
  }

  handleWaypointMarkerClick (marker) {
    this.props.onWaypointSelection(marker.waypoint_id)
  }

  iconForWaypoint ({ icon = defaultWaypointIcon }) {
    return global.L.divIcon(icon)
  }

  updateRoutes (routes, tourers) {
    this._routes && this._routes.forEach((segment) => (
      this._map.removeLayer(segment)
    ))
    this._startMarker && this._map.removeLayer(this._startMarker)
    this._finishMarker && this._map.removeLayer(this._finishMarker)
    this._waypointMarkers && this._map.removeLayer(this._waypointMarkers)
    this.renderRoutes(routes)
    this.renderRouteConnections()
    this.updateTourers(tourers, routes)
  }

  renderStartAndFinish (start, finish) {
    this._startMarker = global.L.marker(start, { icon: this._startIcon }).addTo(this._map)
    this._finishMarker = global.L.marker(finish, { icon: this._finishIcon }).addTo(this._map)
  }

  renderRoutes (routes = [], focus) {
    const firstPoint = first((first(routes) || {}).waypoints)
    const lastPoint = last((last(routes) || {}).waypoints)
    this._routes = routes.map(this.renderRouteSegment.bind(this))
    this.renderStartAndFinish(firstPoint, lastPoint)
    this.renderWaypoints(routes)
    if (focus) {
      this.focusOnRoute(routes)
    }
  }

  renderRouteSegment ({
    style = defaultSegmentStyle,
    points = []
  }) {
    return global.L.polyline(points, style).addTo(this._map)
  }

  renderRouteConnections () {
    const {
      routes,
      connectRoutes,
      connectorStyles = defaultConnectorStyles
    } = this.props

    if (connectRoutes) {
      const connectorPaths = routes.reduce((paths, current, index, routes) => (
        index > 0 ? [
          ...paths,
          [last(routes[index - 1].waypoints), first(routes[index].waypoints)]
        ] : paths
      ), []);
      connectorPaths.map(path => global.L.polyline(path, connectorStyles).addTo(this._map))
    }
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
  ),
  startIcon: PropTypes.shape({
    iconSize: PropTypes.arrayOf(
      PropTypes.number,
      PropTypes.number
    ),
    className: PropTypes.string,
    html: PropTypes.string
  }),
  finishIcon: PropTypes.shape({
    iconSize: PropTypes.arrayOf(
      PropTypes.number,
      PropTypes.number
    ),
    className: PropTypes.string,
    html: PropTypes.string
  })
}

Map.defaultProps = {
  routes: [],
  tourers: [],
  startIcon: defaultStartIcon,
  finishIcon: defaultFinishIcon,
  onSelection: () => {},
  onTourerDeselection: () => {},
  onWaypointSelection: () => {},
  tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.jpg',
  tileAttribution: '&copy; <a href="http://www.esri.com/">Esri</a>'
}

export default Map
