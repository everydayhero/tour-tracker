'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _constants = require('../constants');

var fetchRoute = function fetchRoute(state) {
  return _extends({}, state, {
    status: 'fetching'
  });
};

var receiveRouteFailure = function receiveRouteFailure(state, _ref) {
  var error = _ref.error;
  return _extends({}, state, {
    status: 'failed',
    error: error
  });
};

var receiveRouteSuccess = function receiveRouteSuccess(state, _ref2) {
  var route = _ref2.route;
  return _extends({}, state, {
    status: 'fetched',
    route: route
  });
};

var selectTourer = function selectTourer(state, _ref3) {
  var id = _ref3.id;
  return _extends({}, state, {
    selected: id
  });
};

exports.default = function (state, _ref4) {
  var type = _ref4.type;
  var payload = _ref4.payload;

  switch (type) {
    case _constants.REQUEST_ROUTE:
      return fetchRoute(state);
    case _constants.RECEIVE_ROUTE_FAILURE:
      return receiveRouteFailure(state, payload);
    case _constants.RECEIVE_ROUTE_SUCCESS:
      return receiveRouteSuccess(state, payload);
    case _constants.SELECT_TOURER:
      return selectTourer(state, payload);
    default:
      return state;
  }
};