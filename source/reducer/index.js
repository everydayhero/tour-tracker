import {
  REQUEST_ROUTE,
  RECEIVE_ROUTE_SUCCESS,
  RECEIVE_ROUTE_FAILURE,
  SELECT_TOURER
} from '../constants'

const fetchRoute = (state) => ({
  ...state,
  status: 'fetching'
})

const receiveRouteFailure = (state, { error }) => ({
  ...state,
  status: 'failed',
  error
})

const receiveRouteSuccess = (state, { route }) => ({
  ...state,
  status: 'fetched',
  route
})

const selectTourer = (state, { id }) => ({
  ...state,
  selected: id
})

export default (state, { type, payload }) => {
  switch (type) {
    case REQUEST_ROUTE:
      return fetchRoute(state)
    case RECEIVE_ROUTE_FAILURE:
      return receiveRouteFailure(state, payload)
    case RECEIVE_ROUTE_SUCCESS:
      return receiveRouteSuccess(state, payload)
    case SELECT_TOURER:
      return selectTourer(state, payload)
    default:
      return state
  }
}
