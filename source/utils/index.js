import axios from 'axios'
import { decode } from 'polyline'

const EARTHS_RADIUS_IN_METERS = 6371000

const last = (arr) => arr[arr.length - 1]

const toRad = (value) => (value * Math.PI / 180)
const toDeg = (value) => (value / Math.PI * 180)

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

const decoratePoint = (point, previous, next) => ({
  point,
  distance: calcDistance(previous, point),
  bearing: calcBearing(point, next)
})

const pointToDecimal = ([x, y]) => (
  [x / 10, y / 10]
)

const currentTotal = (points) => (
  (last(points) || { totalDistance: 0 }).totalDistance
)

const decoratePoints = (
  decoratedPoints,
  point,
  index,
  points
) => {
  const prev = points[index - 1] || point
  const next = points[index + 1] || point

  const decorated = decoratePoint(
    pointToDecimal(point),
    pointToDecimal(prev),
    pointToDecimal(next)
  )

  const totalDistance = currentTotal(
    decoratedPoints
  ) + decorated.distance

  return [
    ...decoratedPoints,
    {
      ...decorated,
      totalDistance
    }
  ]
}

const transformResponse = ({
  route_geometry = ''
} = {}) => (
  decode(route_geometry).reduce(decoratePoints, [])
)

const buildQuery = ({
  waypoints = [],
  zoom = 12
}) => ([
  `z=${zoom}`,
  ...waypoints.map(
    (wp) => `loc=${wp.join(',')}`
  )
].join('&'))

const buildUrl = ({
  waypoints = [],
  zoom = 12
}) => ([
  'http://api-osrm-routed-production.tilestream.net/viaroute',
  buildQuery({ waypoints, zoom })
].join('?'))

export const findRoute = ({
  waypoints = [],
  zoom = 12
}) => (
  axios(
    buildUrl({ waypoints, zoom })
  ).then(
    ({ data }) => transformResponse(data)
  )
)
