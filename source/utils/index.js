import axios from 'axios'
import { decode } from 'polyline'
import { EARTHS_RADIUS_IN_METERS } from '../constants'

export const toRad = (value) => (value * Math.PI / 180)
export const toDeg = (value) => (value / Math.PI * 180)

export const first = (arr = []) => arr.slice(0)[0]
export const last = (arr = []) => arr.slice(0)[arr.length - 1]

export const calcBearing = (fromPoint, toPoint) => {
  const xA = toRad(fromPoint.lat)
  const yA = toRad(fromPoint.lng)
  const xB = toRad(toPoint.lat)
  const yB = toRad(toPoint.lng)
  const deltaY = yB - yA

  const x = Math.cos(xB) * Math.sin(deltaY)
  const y = Math.cos(xA) * Math.sin(xB) -
            Math.sin(xA) * Math.cos(xB) *
            Math.cos(deltaY)

  return (toDeg(Math.atan2(x, y)) + 360) % 360
}

export const calcDistance = (fromPoint, toPoint) => {
  const xA = toRad(fromPoint.lat)
  const yA = toRad(fromPoint.lng)
  const xB = toRad(toPoint.lat)
  const yB = toRad(toPoint.lng)
  const deltaY = yB - yA

  if (xA === xB && yA === yB) {
    return 0
  }

  return Math.acos(Math.min(
    Math.sin(xA) * Math.sin(xB) +
    Math.cos(xA) * Math.cos(xB) *
    Math.cos(deltaY)
  ), 1) * EARTHS_RADIUS_IN_METERS
}

const polylineToPoints = (routeGeometry = '') => (
  decode(routeGeometry).map((point) => {
    const [lat, lng] = point
    return {
      lat,
      lng
    }
  })
)

const buildWaypoints = (waypoints) => waypoints.map(point => `${point.lng},${point.lat}`).join(';')

const buildUrl = ({ waypoints = [] }) => `https://router.project-osrm.org/route/v1/driving/${buildWaypoints(waypoints)}?overview=full`

export const findRoute = ({ waypoints = [] }) => (
  axios(buildUrl({ waypoints }))
    .then(({ data }) => ({
      points: polylineToPoints(data.routes[0].geometry),
      distance: data.routes[0].distance
    }))
)
