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

  return Math.acos(
    Math.sin(xA) * Math.sin(xB) +
    Math.cos(xA) * Math.cos(xB) *
    Math.cos(deltaY)
  ) * EARTHS_RADIUS_IN_METERS
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

const pointToDecimal = ([x, y]) => (
  [x / 10, y / 10]
)

const decoratePoints = (
  decorated,
  point,
  index,
  points
) => {
  const prev = points[index - 1]
  const next = points[index + 1]

  const prevDistance = (decorated[0] || { distance: 0 }).distance

  decorated.push(decoratePoint(
    prevDistance,
    pointToDecimal(point),
    prev && pointToDecimal(prev),
    next && pointToDecimal(next)
  ))

  return decorated
}

const polylineToPoints = (routeGeometry = '') => (
  decode(routeGeometry).reduce(decoratePoints, [])
)

const buildQuery = ({
  waypoints = [],
  zoom = 12
}) => ([
  `z=${zoom}`,
  ...waypoints.map(
    (wp) => `loc=${wp.lat},${wp.lng}`
  )
].join('&'))

const buildUrl = ({
  waypoints = [],
  zoom = 12
}) => ([
  'https://router.project-osrm.org/viaroute',
  buildQuery({ waypoints, zoom })
].join('?'))

export const findRoute = ({
  waypoints = [],
  zoom = 12
}) => (
  axios(
    buildUrl({ waypoints, zoom })
  ).then(
    ({ data }) => polylineToPoints(data.route_geometry)
  )
)
