import { findRoute } from '../utils'
import {
  REQUEST_ROUTE,
  RECEIVE_ROUTE_SUCCESS,
  RECEIVE_ROUTE_FAILURE,
  SELECT_TOURER,
  SELECT_WAYPOINT
} from '../constants'

const requestRoute = (index) => ({
  type: REQUEST_ROUTE,
  payload: { index }
})

const receiveRouteSuccess = (index, { points, distance }) => ({
  type: RECEIVE_ROUTE_SUCCESS,
  payload: { index, points, distance }
})

const receiveRouteFailure = (index, error) => ({
  type: RECEIVE_ROUTE_FAILURE,
  payload: { index, error }
})

export const fetchRoute = (index, waypoints) => (dispatch) => {
  dispatch(requestRoute(index))

  return findRoute({ waypoints }).then((points) => (
    dispatch(receiveRouteSuccess(index, points))
  )).catch((error) => (
    dispatch(receiveRouteFailure(index, error))
  ))
}

export const selectTourer = (id) => ({
  type: SELECT_TOURER,
  payload: { id }
})

export const selectWaypoint = (id) => ({
  type: SELECT_WAYPOINT,
  payload: { id }
})
