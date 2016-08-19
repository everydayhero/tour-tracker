'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _constants = require('../constants');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var updateItem = function updateItem(collection, index, attributes) {
  return [].concat(_toConsumableArray(collection.slice(0, index)), [_extends({}, collection[index], attributes)], _toConsumableArray(collection.slice(index + 1)));
};

var requestRoute = function requestRoute(state, _ref) {
  var index = _ref.index;
  return _extends({}, state, {
    routes: updateItem(state.routes, index, { status: 'fetching' })
  });
};

var receiveRouteFailure = function receiveRouteFailure(state, _ref2) {
  var index = _ref2.index;
  var error = _ref2.error;
  return _extends({}, state, {
    routes: updateItem(state.routes, index, { status: 'failed', error: error })
  });
};

var receiveRouteSuccess = function receiveRouteSuccess(state, _ref3) {
  var index = _ref3.index;
  var points = _ref3.points;
  return _extends({}, state, {
    routes: updateItem(state.routes, index, { status: 'fetched', error: '', points: points })
  });
};

var selectTourer = function selectTourer(state, _ref4) {
  var id = _ref4.id;
  return _extends({}, state, {
    selected: id
  });
};

var selectWaypoint = function selectWaypoint(state, _ref5) {
  var id = _ref5.id;
  return _extends({}, state, {
    selectedWaypoint: id
  });
};

exports.default = function () {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _ref6 = arguments[1];
  var type = _ref6.type;
  var payload = _ref6.payload;

  switch (type) {
    case _constants.REQUEST_ROUTE:
      return requestRoute(state, payload);
    case _constants.RECEIVE_ROUTE_FAILURE:
      return receiveRouteFailure(state, payload);
    case _constants.RECEIVE_ROUTE_SUCCESS:
      return receiveRouteSuccess(state, payload);
    case _constants.SELECT_TOURER:
      return selectTourer(state, payload);
    case _constants.SELECT_WAYPOINT:
      return selectWaypoint(state, payload);
    default:
      return state;
  }
};