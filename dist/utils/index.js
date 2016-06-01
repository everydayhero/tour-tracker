'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findRoute = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _polyline = require('polyline');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var EARTHS_RADIUS_IN_METERS = 6371000;

var last = function last(arr) {
  return arr[arr.length - 1];
};

var toRad = function toRad(value) {
  return value * Math.PI / 180;
};
var toDeg = function toDeg(value) {
  return value / Math.PI * 180;
};

var calcBearing = function calcBearing(_ref, _ref2) {
  var _ref4 = _slicedToArray(_ref, 2);

  var latA = _ref4[0];
  var lonA = _ref4[1];

  var _ref3 = _slicedToArray(_ref2, 2);

  var latB = _ref3[0];
  var lonB = _ref3[1];

  var xA = toRad(latA);
  var yA = toRad(lonA);
  var xB = toRad(latB);
  var yB = toRad(lonB);
  var deltaY = yB - yA;
  var x = Math.cos(xB) * Math.sin(deltaY);
  var y = Math.cos(xA) * Math.sin(xB) - Math.sin(xA) * Math.cos(xB) * Math.cos(deltaY);

  return (toDeg(Math.atan2(x, y)) + 360) % 360;
};

var calcDistance = function calcDistance(_ref5, _ref6) {
  var _ref8 = _slicedToArray(_ref5, 2);

  var latA = _ref8[0];
  var lonA = _ref8[1];

  var _ref7 = _slicedToArray(_ref6, 2);

  var latB = _ref7[0];
  var lonB = _ref7[1];

  var xA = toRad(latA);
  var yA = toRad(lonA);
  var xB = toRad(latB);
  var yB = toRad(lonB);
  var deltaY = yB - yA;

  return Math.acos(Math.sin(xA) * Math.sin(xB) + Math.cos(xA) * Math.cos(xB) * Math.cos(deltaY)) * EARTHS_RADIUS_IN_METERS;
};

var decoratePoint = function decoratePoint(point, previous, next) {
  return {
    point: point,
    distance: calcDistance(previous, point),
    bearing: calcBearing(point, next)
  };
};

var pointToDecimal = function pointToDecimal(_ref9) {
  var _ref10 = _slicedToArray(_ref9, 2);

  var x = _ref10[0];
  var y = _ref10[1];
  return [x / 10, y / 10];
};

var currentTotal = function currentTotal(points) {
  return (last(points) || { totalDistance: 0 }).totalDistance;
};

var decoratePoints = function decoratePoints(decoratedPoints, point, index, points) {
  var prev = points[index - 1] || point;
  var next = points[index + 1] || point;

  var decorated = decoratePoint(pointToDecimal(point), pointToDecimal(prev), pointToDecimal(next));

  var totalDistance = currentTotal(decoratedPoints) + decorated.distance;

  return [].concat(_toConsumableArray(decoratedPoints), [_extends({}, decorated, {
    totalDistance: totalDistance
  })]);
};

var transformResponse = function transformResponse() {
  var _ref11 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref11$route_geometry = _ref11.route_geometry;
  var route_geometry = _ref11$route_geometry === undefined ? '' : _ref11$route_geometry;
  return (0, _polyline.decode)(route_geometry).reduce(decoratePoints, []);
};

var buildQuery = function buildQuery(_ref12) {
  var _ref12$waypoints = _ref12.waypoints;
  var waypoints = _ref12$waypoints === undefined ? [] : _ref12$waypoints;
  var _ref12$zoom = _ref12.zoom;
  var zoom = _ref12$zoom === undefined ? 12 : _ref12$zoom;
  return ['z=' + zoom].concat(_toConsumableArray(waypoints.map(function (wp) {
    return 'loc=' + wp.join(',');
  }))).join('&');
};

var buildUrl = function buildUrl(_ref13) {
  var _ref13$waypoints = _ref13.waypoints;
  var waypoints = _ref13$waypoints === undefined ? [] : _ref13$waypoints;
  var _ref13$zoom = _ref13.zoom;
  var zoom = _ref13$zoom === undefined ? 12 : _ref13$zoom;
  return ['http://api-osrm-routed-production.tilestream.net/viaroute', buildQuery({ waypoints: waypoints, zoom: zoom })].join('?');
};

var findRoute = exports.findRoute = function findRoute(_ref14) {
  var _ref14$waypoints = _ref14.waypoints;
  var waypoints = _ref14$waypoints === undefined ? [] : _ref14$waypoints;
  var _ref14$zoom = _ref14.zoom;
  var zoom = _ref14$zoom === undefined ? 12 : _ref14$zoom;
  return (0, _axios2.default)(buildUrl({ waypoints: waypoints, zoom: zoom })).then(function (_ref15) {
    var data = _ref15.data;
    return transformResponse(data);
  });
};