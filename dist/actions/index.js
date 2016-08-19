'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectWaypoint = exports.selectTourer = exports.fetchRoute = undefined;

var _utils = require('../utils');

var _constants = require('../constants');

var requestRoute = function requestRoute(index) {
  return {
    type: _constants.REQUEST_ROUTE,
    payload: { index: index }
  };
};

var receiveRouteSuccess = function receiveRouteSuccess(index, points) {
  return {
    type: _constants.RECEIVE_ROUTE_SUCCESS,
    payload: { index: index, points: points }
  };
};

var receiveRouteFailure = function receiveRouteFailure(index, error) {
  return {
    type: _constants.RECEIVE_ROUTE_FAILURE,
    payload: { index: index, error: error }
  };
};

var fetchRoute = exports.fetchRoute = function fetchRoute(index, waypoints) {
  return function (dispatch) {
    dispatch(requestRoute(index));

    return (0, _utils.findRoute)({ waypoints: waypoints }).then(function (points) {
      return dispatch(receiveRouteSuccess(index, points));
    }).catch(function (error) {
      return dispatch(receiveRouteFailure(index, error));
    });
  };
};

var selectTourer = exports.selectTourer = function selectTourer(id) {
  return {
    type: _constants.SELECT_TOURER,
    payload: { id: id }
  };
};

var selectWaypoint = exports.selectWaypoint = function selectWaypoint(id) {
  return {
    type: _constants.SELECT_WAYPOINT,
    payload: { id: id }
  };
};