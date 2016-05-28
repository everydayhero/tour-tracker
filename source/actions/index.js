import { findRoute } from '../utils'
import {
  REQUEST_ROUTE,
  RECEIVE_ROUTE_SUCCESS,
  RECEIVE_ROUTE_FAILURE,
  SELECT_TOURER
} from '../constants'

const requestRoute = () => ({
  type: REQUEST_ROUTE
})

const receiveRouteSuccess = (route) => ({
  type: RECEIVE_ROUTE_SUCCESS,
  payload: { route }
})

const receiveRouteFailure = (error) => ({
  type: RECEIVE_ROUTE_FAILURE,
  payload: { error }
})

export const selectTourer = (id) => ({
  type: SELECT_TOURER,
  payload: { id }
})

export const fetchRoute = (waypoints) => (dispatch) => {
  dispatch(requestRoute())

  return findRoute({ waypoints }).then(
    (route) => dispatch(receiveRouteSuccess(route))
  ).catch(
    (error) => dispatch(receiveRouteFailure(error))
  )
}
