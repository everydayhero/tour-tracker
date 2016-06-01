'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchRoute = exports.selectTourer = undefined;

var _utils = require('../utils');

var _constants = require('../constants');

var requestRoute = function requestRoute() {
  return {
    type: _constants.REQUEST_ROUTE
  };
};

var receiveRouteSuccess = function receiveRouteSuccess(route) {
  return {
    type: _constants.RECEIVE_ROUTE_SUCCESS,
    payload: { route: route }
  };
};

var receiveRouteFailure = function receiveRouteFailure(error) {
  return {
    type: _constants.RECEIVE_ROUTE_FAILURE,
    payload: { error: error }
  };
};

var selectTourer = exports.selectTourer = function selectTourer(id) {
  return {
    type: _constants.SELECT_TOURER,
    payload: { id: id }
  };
};

var fetchRoute = exports.fetchRoute = function fetchRoute(waypoints) {
  return function (dispatch) {
    dispatch(requestRoute());

    return (0, _utils.findRoute)({ waypoints: waypoints }).then(function (route) {
      return dispatch(receiveRouteSuccess(route));
    }).catch(function (error) {
      return dispatch(receiveRouteFailure(error));
    });
  };
};