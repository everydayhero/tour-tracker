import React from 'react'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import find from 'lodash/find'
import isEqual from 'lodash/isEqual'
import sortBy from 'lodash/sortBy'

const EARTHS_RADIUS_IN_METERS = 6371000
const toRad = (value) => value * Math.PI / 180
const toDeg = (value) => value / Math.PI * 180

const NullRouteDatum = {
  totalDistance: 0,
  bearing: 0,
  point: [0, 0]
}

const findTourerRouteStartingDatum = (distance, routeData) => (
  find(routeData, (datum, index) => {
    const next = routeData[index + 1] || { totalDistance: 0 }

    return (
      (distance > datum.totalDistance) &&
      (distance < next.totalDistance)
    )
  }) || NullRouteDatum
)

const calcTourerPosition = (distance, routeData) => {
  const firstDatum = routeData[0]
  const finalDatum = routeData[routeData.length - 1]
  const routeTotal = finalDatum.totalDistance

  if (distance <= 0) return firstDatum.point
  if (distance >= routeTotal) return finalDatum.point

  const startDatum = findTourerRouteStartingDatum(distance, routeData)
  const currentBearingDistance = distance - startDatum.totalDistance
  const point = startDatum.point
  const lat = toRad(point[0]) || 0
  const lon = toRad(point[1]) || 0
  const bearing = toRad(startDatum.bearing) || 0
  const angularDistance = currentBearingDistance / EARTHS_RADIUS_IN_METERS

  const tourerLat = Math.asin(
    Math.sin(lat) * Math.cos(angularDistance) +
    Math.cos(lat) * Math.sin(angularDistance) *
    Math.cos(bearing)
  )
  const tourerLon = Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat),
    Math.cos(angularDistance) - Math.sin(lat) * Math.sin(tourerLat)
  ) + lon

  return [toDeg(tourerLat), toDeg(tourerLon)]
}

const defaultTourerIcon = {
  iconSize: L.point(42, 42),
  className: '',
  html: '<div style="border-radius: 100%; background-color: red; width: 100%; height: 100%" />'
}

const defaultStartIcon = {
  iconSize: L.point(72, 72),
  className: '',
  html: '<div style="border-radius: 100%; background-color: green; width: 100%; height: 100%" />'
}

const defaultFinishIcon = {
  iconSize: L.point(72, 72),
  className: '',
  html: '<div style="border-radius: 100%; background-color: lightgrey; width: 100%; height: 100%" />'
}

class Map extends React.Component {
  shouldComponentUpdate () {
    return false
  }

  componentWillReceiveProps (nextProps) {
    const {
      route: nextRoute,
      tourers: nextTourers,
      selected: nextSelected,
      interactive = false
    } = nextProps

    const {
      route = [],
      tourers = [],
      selected
    } = this.props

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

    if (!isEqual(route.map((r) => r.distance), nextRoute.map((r) => r.distance))) {
      this.updateRoute(nextRoute, nextTourers)
    } else if (!isEqual(sortBy(tourers, (t) => t.id), sortBy(nextTourers, (t) => t.id))) {
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

    if (this.props.route.length) {
      this.renderRoute(this.props.route)
      this.renderTourers()
    } else {
      this._map.fitBounds(this.props.waypoints)
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

  updateTourer (tourer, route = this.props.route) {
    const point = calcTourerPosition(tourer.distance, route)
    const icon = this.iconForTourer(tourer)
    const marker = tourer.marker
    marker.setPopupContent(tourer.popup)
    marker.setLatLng(point)
    marker.setIcon(icon)
    marker.tourer_id = tourer.id

    return { ...tourer }
  }

  updateTourers (nextTourers, route = this.props.route) {
    this._tourers = nextTourers.map((nextTourer) => {
      const existingTourer = find(this._tourers, (t) => t.id === nextTourer.id)
      if (!existingTourer) {
        return this.createTourer(nextTourer, route)
      } else {
        return this.updateTourer({
          ...existingTourer,
          ...nextTourer,
          marker: existingTourer.marker
        }, route)
      }
    })
  }

  createTourer (tourer, route = this.props.route) {
    const point = calcTourerPosition(tourer.distance, route)
    const icon = this.iconForTourer(tourer)
    const marker = L.marker(point, { icon })

    if (tourer.popup) {
      marker.bindPopup(
        tourer.popup,
        { offset: L.point(0, -32), closeOnClick: false }
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

  renderTourers () {
    const { tourers = [] } = this.props
    this._map.addLayer(this._markers)
    this._tourers = tourers.map(this.createTourer.bind(this))
  }

  updateRoute (route, tourers) {
    this._route && this._map.removeLayer(this._route)
    this._startMarker && this._map.removeLayer(this._startMarker)
    this._finishMarker && this._map.removeLayer(this._finishMarker)
    this.renderRoute(route)
    this.updateTourers(tourers, route)
  }

  renderStartAndFinish (start, finish) {
    this._startMarker = L.marker(start, { icon: this._startIcon }).addTo(this._map)
    this._finishMarker = L.marker(finish, { icon: this._finishIcon }).addTo(this._map)
  }

  renderRoute (route) {
    const points = route.map((rp) => rp.point)
    this._route = L.polyline(points).addTo(this._map)
    this.renderStartAndFinish(points[0], points[points.length - 1])
    this._map.fitBounds(points, {
      padding: [50, 50]
    })
  }

  render () {
    return <div style={{ width: '100%', height: '100%' }} />
  }
}

const { PropTypes } = React

Map.propTypes = {
  waypoints: PropTypes.array.isRequired,
  route: PropTypes.array,
  tourers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      distance: PropTypes.number.isRequired,
      popup: PropTypes.string,
      icon: PropTypes.shape({
        iconSize: PropTypes.arrayOf(PropTypes.number),
        className: PropTypes.string,
        html: PropTypes.string
      })
    })
  )
}

Map.defaultProps = {
  route: [],
  tourers: [],
  onSelection: () => {},
  onTourerDeselection: () => {},
  tileUrl: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
}

export default Map
