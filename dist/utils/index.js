'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findRoute = exports.last = exports.first = exports.toDeg = exports.toRad = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _polyline = require('polyline');

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var toRad = exports.toRad = function toRad(value) {
  return value * Math.PI / 180;
};
var toDeg = exports.toDeg = function toDeg(value) {
  return value / Math.PI * 180;
};

var first = exports.first = function first() {
  var arr = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
  return arr.slice(0)[0];
};
var last = exports.last = function last() {
  var arr = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
  return arr.slice(0)[arr.length - 1];
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

  return Math.acos(Math.sin(xA) * Math.sin(xB) + Math.cos(xA) * Math.cos(xB) * Math.cos(deltaY)) * _constants.EARTHS_RADIUS_IN_METERS;
};

var decoratePoint = function decoratePoint(prevDistance, point, prev, next) {
  var _point = _slicedToArray(point, 2);

  var lat = _point[0];
  var lng = _point[1];


  return {
    lat: lat,
    lng: lng,
    distance: prevDistance + calcDistance(prev, point),
    bearing: calcBearing(point, next)
  };
};

var pointToDecimal = function pointToDecimal(_ref9) {
  var _ref10 = _slicedToArray(_ref9, 2);

  var x = _ref10[0];
  var y = _ref10[1];
  return [x / 10, y / 10];
};

var decoratePoints = function decoratePoints(decorated, point, index, points) {
  var prev = points[index - 1] || point;
  var next = points[index + 1] || point;

  var prevDistance = (last(decorated) || { distance: 0 }).distance;

  return [].concat(_toConsumableArray(decorated), [decoratePoint(prevDistance, pointToDecimal(point), pointToDecimal(prev), pointToDecimal(next))]);
};

var polylineToPoints = function polylineToPoints() {
  var routeGeometry = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
  return (0, _polyline.decode)(routeGeometry).reduce(decoratePoints, []);
};

var buildQuery = function buildQuery(_ref11) {
  var _ref11$waypoints = _ref11.waypoints;
  var waypoints = _ref11$waypoints === undefined ? [] : _ref11$waypoints;
  var _ref11$zoom = _ref11.zoom;
  var zoom = _ref11$zoom === undefined ? 12 : _ref11$zoom;
  return ['z=' + zoom].concat(_toConsumableArray(waypoints.map(function (wp) {
    return 'loc=' + wp.join(',');
  }))).join('&');
};

var buildUrl = function buildUrl(_ref12) {
  var _ref12$waypoints = _ref12.waypoints;
  var waypoints = _ref12$waypoints === undefined ? [] : _ref12$waypoints;
  var _ref12$zoom = _ref12.zoom;
  var zoom = _ref12$zoom === undefined ? 12 : _ref12$zoom;
  return ['http://api-osrm-routed-production.tilestream.net/viaroute', buildQuery({ waypoints: waypoints, zoom: zoom })].join('?');
};

var findRoute = exports.findRoute = function findRoute(_ref13) {
  var _ref13$waypoints = _ref13.waypoints;
  var waypoints = _ref13$waypoints === undefined ? [] : _ref13$waypoints;
  var _ref13$zoom = _ref13.zoom;
  var zoom = _ref13$zoom === undefined ? 12 : _ref13$zoom;
  return (0, _axios2.default)(buildUrl({ waypoints: waypoints, zoom: zoom })).then(function (_ref14) {
    var data = _ref14.data;
    return polylineToPoints(data.route_geometry);
  });
};