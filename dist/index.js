'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _server = require('react-dom/server');

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _sortBy = require('lodash/sortBy');

var _sortBy2 = _interopRequireDefault(_sortBy);

var _icons = require('./icons');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EARTHS_RADIUS_IN_METERS = 6371000;
var toRad = function toRad(value) {
  return value * Math.PI / 180;
};
var toDeg = function toDeg(value) {
  return value / Math.PI * 180;
};

var NullRouteDatum = {
  totalDistance: 0,
  bearing: 0,
  point: [0, 0]
};

var findTourerRouteStartingDatum = function findTourerRouteStartingDatum(distance, routeData) {
  return (0, _find2.default)(routeData, function (datum, index) {
    var next = routeData[index + 1] || { totalDistance: 0 };

    return distance > datum.totalDistance && distance < next.totalDistance;
  }) || NullRouteDatum;
};

var calcTourerPosition = function calcTourerPosition(distance, routeData) {
  var firstDatum = routeData[0] || NullRouteDatum;
  var finalDatum = routeData[routeData.length - 1] || NullRouteDatum;
  var routeTotal = finalDatum.totalDistance;

  if (distance <= 0) return firstDatum.point;
  if (distance >= routeTotal) return finalDatum.point;

  var startDatum = findTourerRouteStartingDatum(distance, routeData);
  var currentBearingDistance = distance - startDatum.totalDistance;
  var point = startDatum.point;
  var lat = toRad(point[0]) || 0;
  var lon = toRad(point[1]) || 0;
  var bearing = toRad(startDatum.bearing) || 0;
  var angularDistance = currentBearingDistance / EARTHS_RADIUS_IN_METERS;

  var tourerLat = Math.asin(Math.sin(lat) * Math.cos(angularDistance) + Math.cos(lat) * Math.sin(angularDistance) * Math.cos(bearing));
  var tourerLon = Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat), Math.cos(angularDistance) - Math.sin(lat) * Math.sin(tourerLat)) + lon;

  return [toDeg(tourerLat), toDeg(tourerLon)];
};

var defaultTourerIcon = {
  iconSize: _leaflet2.default.point(30, 30),
  iconAnchor: [15, 30],
  className: '',
  html: (0, _server.renderToStaticMarkup)(_react2.default.createElement(_icons.Pin, { color: 'seagreen' }))
};

var defaultStartIcon = {
  iconSize: _leaflet2.default.point(30, 30),
  className: '',
  html: (0, _server.renderToStaticMarkup)(_react2.default.createElement(_icons.Checkerboard, { color: 'seagreen' }))
};

var defaultFinishIcon = {
  iconSize: _leaflet2.default.point(30, 30),
  className: '',
  html: (0, _server.renderToStaticMarkup)(_react2.default.createElement(_icons.Checkerboard, null))
};

var Map = function (_React$Component) {
  _inherits(Map, _React$Component);

  function Map() {
    _classCallCheck(this, Map);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Map).apply(this, arguments));
  }

  _createClass(Map, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      return false;
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _props = this.props;
      var _props$route = _props.route;
      var route = _props$route === undefined ? [] : _props$route;
      var _props$tourers = _props.tourers;
      var tourers = _props$tourers === undefined ? [] : _props$tourers;
      var selected = _props.selected;
      var nextRoute = nextProps.route;
      var nextTourers = nextProps.tourers;
      var nextSelected = nextProps.selected;
      var _nextProps$interactiv = nextProps.interactive;
      var interactive = _nextProps$interactiv === undefined ? true : _nextProps$interactiv;


      if (interactive) {
        this._map.dragging.enable();
        this._map.touchZoom.enable();
        this._map.doubleClickZoom.enable();
        this._map.scrollWheelZoom.enable();
        this._map.keyboard.enable();
      } else {
        this._map.dragging.disable();
        this._map.touchZoom.disable();
        this._map.doubleClickZoom.disable();
        this._map.scrollWheelZoom.disable();
        this._map.keyboard.disable();
      }

      if (!(0, _isEqual2.default)(route.map(function (r) {
        return r.distance;
      }), nextRoute.map(function (r) {
        return r.distance;
      }))) {
        this.updateRoute(nextRoute, nextTourers);
      } else if (!(0, _isEqual2.default)((0, _sortBy2.default)(tourers, function (t) {
        return t.id;
      }), (0, _sortBy2.default)(nextTourers, function (t) {
        return t.id;
      }))) {
        this.updateTourers(nextTourers);
      }

      if (nextSelected === null) {
        var tourer = (0, _find2.default)(this._tourers, function (t) {
          return t.id === selected;
        });
        tourer && tourer.marker.closePopup();
      } else {
        var _tourer = (0, _find2.default)(this._tourers, function (t) {
          return t.id === nextSelected;
        });
        _tourer && _tourer.marker.openPopup();
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._map = _leaflet2.default.map(_reactDom2.default.findDOMNode(this));

      this._map.on('popupopen', this.handlePopupOpen.bind(this));

      this._startIcon = _leaflet2.default.divIcon(defaultStartIcon);
      this._finishIcon = _leaflet2.default.divIcon(defaultFinishIcon);

      this._markers = _leaflet2.default.featureGroup();
      this._map.addLayer(this._markers);

      _leaflet2.default.tileLayer(this.props.tileUrl, { attribution: this.props.tileAttribution }).addTo(this._map);

      if (this.props.route.length) {
        this.renderRoute(this.props.route);
        this.renderTourers();
      } else {
        this._map.fitBounds(this.props.waypoints);
      }
    }
  }, {
    key: 'openTourerPopup',
    value: function openTourerPopup(marker) {
      var map = this._map;
      var popup = marker.getPopup();
      var px = map.project(popup._latlng);
      px.y -= popup._container.clientHeight / 2;
      map.panTo(map.unproject(px));
    }
  }, {
    key: 'handlePopupOpen',
    value: function handlePopupOpen(e) {
      var marker = e.popup._source;

      if (marker.tourer_id) {
        this.openTourerPopup(marker);
      }
    }
  }, {
    key: 'handleMarkerClick',
    value: function handleMarkerClick(marker) {
      marker.openPopup();
      this.props.onSelection(marker.tourer_id);
    }
  }, {
    key: 'iconForTourer',
    value: function iconForTourer(_ref) {
      var _ref$icon = _ref.icon;
      var icon = _ref$icon === undefined ? defaultTourerIcon : _ref$icon;

      return _leaflet2.default.divIcon(icon);
    }
  }, {
    key: 'updateTourer',
    value: function updateTourer(tourer) {
      var route = arguments.length <= 1 || arguments[1] === undefined ? this.props.route : arguments[1];
      var marker = tourer.marker;
      var _tourer$popup = tourer.popup;
      var popup = _tourer$popup === undefined ? {} : _tourer$popup;
      var distance = tourer.distance;

      var point = calcTourerPosition(distance, route);
      var icon = this.iconForTourer(tourer);
      marker.setPopupContent(popup.content);
      marker.setLatLng(point);
      marker.setIcon(icon);
      marker.tourer_id = tourer.id;

      return _extends({}, tourer);
    }
  }, {
    key: 'updateTourers',
    value: function updateTourers() {
      var _this2 = this;

      var nextTourers = arguments.length <= 0 || arguments[0] === undefined ? this.props.tourers : arguments[0];
      var route = arguments.length <= 1 || arguments[1] === undefined ? this.props.route : arguments[1];

      this._tourers = nextTourers.map(function (nextTourer) {
        var existingTourer = (0, _find2.default)(_this2._tourers, function (t) {
          return t.id === nextTourer.id;
        });
        if (!existingTourer) {
          return _this2.createTourer(nextTourer, route);
        } else {
          return _this2.updateTourer(_extends({}, existingTourer, nextTourer, {
            marker: existingTourer.marker
          }), route);
        }
      });
    }
  }, {
    key: 'createTourer',
    value: function createTourer() {
      var _this3 = this;

      var tourer = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var route = arguments.length <= 1 || arguments[1] === undefined ? this.props.route : arguments[1];
      var distance = tourer.distance;
      var popup = tourer.popup;

      var point = calcTourerPosition(distance, route);
      var icon = this.iconForTourer(tourer);
      var marker = _leaflet2.default.marker(point, { icon: icon });

      if (popup) {
        marker.bindPopup(popup.content, popup.options);
      }

      marker.on('click', function () {
        _this3.handleMarkerClick(marker);
      });

      marker.tourer_id = tourer.id;
      this._markers.addLayer(marker);

      return _extends({}, tourer, {
        marker: marker
      });
    }
  }, {
    key: 'renderTourers',
    value: function renderTourers() {
      var _this4 = this;

      var _props$tourers2 = this.props.tourers;
      var tourers = _props$tourers2 === undefined ? [] : _props$tourers2;

      this._tourers = tourers.map(function (tourer) {
        return _this4.createTourer(tourer, _this4.props.route);
      });
    }
  }, {
    key: 'updateRoute',
    value: function updateRoute(route, tourers) {
      this._route && this._map.removeLayer(this._route);
      this._startMarker && this._map.removeLayer(this._startMarker);
      this._finishMarker && this._map.removeLayer(this._finishMarker);
      this.renderRoute(route);
      this.updateTourers(tourers, route);
    }
  }, {
    key: 'renderStartAndFinish',
    value: function renderStartAndFinish(start, finish) {
      this._startMarker = _leaflet2.default.marker(start, { icon: this._startIcon }).addTo(this._map);
      this._finishMarker = _leaflet2.default.marker(finish, { icon: this._finishIcon }).addTo(this._map);
    }
  }, {
    key: 'renderRoute',
    value: function renderRoute() {
      var route = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      var points = route.map(function (rp) {
        return rp.point;
      });
      this._route = _leaflet2.default.polyline(points, this.props.routeStyle).addTo(this._map);
      this.renderStartAndFinish(points[0], points[points.length - 1]);
      this._map.fitBounds(points, {
        padding: [50, 50]
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement('div', { style: { width: '100%', height: '100%' } });
    }
  }]);

  return Map;
}(_react2.default.Component);

var PropTypes = _react2.default.PropTypes;


Map.propTypes = {
  waypoints: PropTypes.array.isRequired,
  route: PropTypes.array,
  tourers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    distance: PropTypes.number.isRequired,
    popup: PropTypes.shape({
      content: PropTypes.string,
      options: PropTypes.object
    }),
    icon: PropTypes.shape({
      iconSize: PropTypes.arrayOf(PropTypes.number),
      className: PropTypes.string,
      html: PropTypes.string
    })
  }))
};

Map.defaultProps = {
  route: [],
  routeStyle: {
    color: '#7ec774'
  },
  tourers: [],
  onSelection: function onSelection() {},
  onTourerDeselection: function onTourerDeselection() {},
  tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.jpg',
  tileAttribution: '&copy; <a href="http://www.esri.com/">Esri</a>'
};

exports.default = Map;