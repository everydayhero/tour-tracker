import axios from 'axios'
import { decode } from 'polyline'
import { EARTHS_RADIUS_IN_METERS } from '../constants'

export const toRad = (value) => (value * Math.PI / 180)
export const toDeg = (value) => (value / Math.PI * 180)

export const first = (arr = []) => arr.slice(0)[0]
export const last = (arr = []) => arr.slice(0)[arr.length - 1]

const calcBearing = (
  [latA, lonA],
  [latB, lonB]
) => {
  const xA = toRad(latA)
  const yA = toRad(lonA)
  const xB = toRad(latB)
  const yB = toRad(lonB)
  const deltaY = yB - yA
  const x = Math.cos(xB) * Math.sin(deltaY)
  const y = Math.cos(xA) * Math.sin(xB) -
            Math.sin(xA) * Math.cos(xB) *
            Math.cos(deltaY)

  return (toDeg(Math.atan2(x, y)) + 360) % 360
}

const calcDistance = (
  [latA, lonA],
  [latB, lonB]
) => {
  const xA = toRad(latA)
  const yA = toRad(lonA)
  const xB = toRad(latB)
  const yB = toRad(lonB)
  const deltaY = yB - yA

  return Math.acos(Math.min(
    Math.sin(xA) * Math.sin(xB) +
    Math.cos(xA) * Math.cos(xB) *
    Math.cos(deltaY)
  ), 1) * EARTHS_RADIUS_IN_METERS
}

const decoratePoint = (prevDistance, point, prev, next) => {
  const [lat, lng] = point
  const distance = prev
    ? prevDistance + calcDistance(prev, point)
    : 0
  const bearing = next
    ? calcBearing(point, next)
    : 0

  return {
    lat,
    lng,
    distance,
    bearing
  }
}

const decoratePoints = (
  decorated,
  point,
  index,
  points
) => {
  const prev = points[index - 1]
  const next = points[index + 1]

  const prevDistance = (decorated[decorated.length - 1] || { distance: 0 }).distance

  decorated.push(decoratePoint(
    prevDistance,
    point,
    prev,
    next
  ))

  return decorated
}

const polylineToPoints = (routeGeometry = '') => (
  decode(routeGeometry).reduce(decoratePoints, [])
)

const buildWaypoints = (waypoints) => waypoints.map(point => `${point.lng},${point.lat}`).join(';')

const buildUrl = ({ waypoints = [] }) => `https://router.project-osrm.org/route/v1/driving/${buildWaypoints(waypoints)}?overview=full`

export const findRoute = ({ waypoints = [] }) => (
  axios(buildUrl({ waypoints }))
    .then(({ data }) => polylineToPoints(data.routes[0].geometry))
)
