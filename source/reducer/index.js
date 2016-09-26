import {
  REQUEST_ROUTE,
  RECEIVE_ROUTE_SUCCESS,
  RECEIVE_ROUTE_FAILURE,
  SELECT_TOURER,
  SELECT_WAYPOINT
} from '../constants'

const updateItem = (collection, index, attributes) => ([
  ...collection.slice(0, index),
  { ...collection[index], ...attributes },
  ...collection.slice(index + 1)
])

const reducePoints = (points) => points.map(({ lat, lng, distance }) => ({ lat, lng, distance }))

const requestRoute = (state, { index }) => ({
  ...state,
  routes: updateItem(state.routes, index, { status: 'fetching' })
})

const receiveRouteFailure = (state, { index, error }) => ({
  ...state,
  routes: updateItem(state.routes, index, { status: 'failed', error })
})

const receiveRouteSuccess = (state, { index, points }) => ({
  ...state,
  routes: updateItem(state.routes, index, { status: 'fetched', error: '', points: reducePoints(points) })
})

const selectTourer = (state, { id }) => ({
  ...state,
  selected: id
})

const selectWaypoint = (state, { id }) => ({
  ...state,
  selectedWaypoint: id
})

export default (state = {}, { type, payload }) => {
  switch (type) {
    case REQUEST_ROUTE:
      return requestRoute(state, payload)
    case RECEIVE_ROUTE_FAILURE:
      return receiveRouteFailure(state, payload)
    case RECEIVE_ROUTE_SUCCESS:
      return receiveRouteSuccess(state, payload)
    case SELECT_TOURER:
      return selectTourer(state, payload)
    case SELECT_WAYPOINT:
      return selectWaypoint(state, payload)
    default:
      return state
  }
}
