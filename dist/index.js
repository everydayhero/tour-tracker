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

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _icons = require('./icons');

var _constants = require('./constants');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NullPoint = {
  distance: 0,
  bearing: 0,
  lat: 0,
  lng: 0
};

var findTourerStartingPoint = function findTourerStartingPoint(distance, points) {
  return (0, _find2.default)(points, function (point, index) {
    var next = points[index + 1] || { distance: 0 };

    return distance > point.distance && distance < next.distance;
  }) || NullPoint;
};

var calcTourerPosition = function calcTourerPosition(distance, points) {
  var firstPoint = (0, _utils.first)(points) || NullPoint;
  var finalPoint = (0, _utils.last)(points) || NullPoint;
  var routeTotal = finalPoint.distance;

  if (distance <= 0) return firstPoint;
  if (distance >= routeTotal) return finalPoint;

  var startPoint = findTourerStartingPoint(distance, points);
  var currentBearingDistance = distance - startPoint.distance;
  var lat = (0, _utils.toRad)(startPoint.lat) || 0;
  var lng = (0, _utils.toRad)(startPoint.lng) || 0;
  var bearing = (0, _utils.toRad)(startPoint.bearing) || 0;
  var angularDistance = currentBearingDistance / _constants.EARTHS_RADIUS_IN_METERS;

  var tourerLat = Math.asin(Math.sin(lat) * Math.cos(angularDistance) + Math.cos(lat) * Math.sin(angularDistance) * Math.cos(bearing));
  var tourerLon = Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat), Math.cos(angularDistance) - Math.sin(lat) * Math.sin(tourerLat)) + lng;

  return {
    lat: (0, _utils.toDeg)(tourerLat),
    lng: (0, _utils.toDeg)(tourerLon)
  };
};

var canRenderRoutes = function canRenderRoutes() {
  var routes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
  return routes.every(function (r) {
    return (r.points || []).length;
  });
};

var defaultTourerIcon = {
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  className: '',
  html: (0, _server.renderToStaticMarkup)(_react2.default.createElement(_icons.Pin, { color: 'seagreen' }))
};

var defaultStartIcon = {
  iconSize: [30, 30],
  className: '',
  html: (0, _server.renderToStaticMarkup)(_react2.default.createElement(_icons.Checkerboard, { color: 'seagreen' }))
};

var defaultFinishIcon = {
  iconSize: [30, 30],
  className: '',
  html: (0, _server.renderToStaticMarkup)(_react2.default.createElement(_icons.Checkerboard, null))
};

var defaultSegmentStyle = {
  color: '#7ec774'
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
      var _this2 = this;

      if (global.L) {
        (function () {
          var _props = _this2.props;
          var _props$routes = _props.routes;
          var routes = _props$routes === undefined ? [] : _props$routes;
          var _props$tourers = _props.tourers;
          var tourers = _props$tourers === undefined ? [] : _props$tourers;
          var selected = _props.selected;
          var nextRoutes = nextProps.routes;
          var nextTourers = nextProps.tourers;
          var nextSelected = nextProps.selected;
          var _nextProps$interactiv = nextProps.interactive;
          var interactive = _nextProps$interactiv === undefined ? true : _nextProps$interactiv;


          if (interactive) {
            _this2._map.dragging.enable();
            _this2._map.touchZoom.enable();
            _this2._map.doubleClickZoom.enable();
            _this2._map.scrollWheelZoom.enable();
            _this2._map.keyboard.enable();
          } else {
            _this2._map.dragging.disable();
            _this2._map.touchZoom.disable();
            _this2._map.doubleClickZoom.disable();
            _this2._map.scrollWheelZoom.disable();
            _this2._map.keyboard.disable();
          }

          if (routes !== nextRoutes && canRenderRoutes(nextRoutes)) {
            _this2.updateRoutes(nextRoutes, nextTourers);
          } else if (tourers !== nextTourers) {
            _this2.updateTourers(nextTourers);
          }

          if (nextSelected === null) {
            var tourer = (0, _find2.default)(_this2._tourers, function (t) {
              return t.id === selected;
            });
            tourer && tourer.marker.closePopup();
          } else {
            var _tourer = (0, _find2.default)(_this2._tourers, function (t) {
              return t.id === nextSelected;
            });
            _tourer && _tourer.marker.openPopup();
          }
        })();
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (global.L) {
        this._map = global.L.map(_reactDom2.default.findDOMNode(this));

        this._map.on('popupopen', this.handlePopupOpen.bind(this));

        this._startIcon = global.L.divIcon(defaultStartIcon);
        this._finishIcon = global.L.divIcon(defaultFinishIcon);

        this._markers = global.L.featureGroup();
        this._map.addLayer(this._markers);

        global.L.tileLayer(this.props.tileUrl, { attribution: this.props.tileAttribution }).addTo(this._map);

        this._map.fitBounds([(0, _utils.first)(((0, _utils.first)(this.props.routes) || {}).waypoints), (0, _utils.last)(((0, _utils.last)(this.props.routes) || {}).waypoints)], { padding: [50, 50] });

        if (canRenderRoutes(this.props.routes)) {
          this.renderRoutes(this.props.routes);
          this.createTourers();
        }
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

      return global.L.divIcon(icon);
    }
  }, {
    key: 'updateTourer',
    value: function updateTourer(tourer) {
      var points = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var marker = tourer.marker;
      var _tourer$popup = tourer.popup;
      var popup = _tourer$popup === undefined ? {} : _tourer$popup;
      var distance = tourer.distance;

      var point = calcTourerPosition(distance, points);
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
      var _this3 = this;

      var nextTourers = arguments.length <= 0 || arguments[0] === undefined ? this.props.tourers : arguments[0];
      var routes = arguments.length <= 1 || arguments[1] === undefined ? this.props.routes : arguments[1];

      var points = routes.reduce(function (acc, route) {
        return acc.concat(route.points.map(function (p) {
          return _extends({}, p, {
            distance: p.distance + ((0, _utils.last)(acc) || { distance: 0 }).distance
          });
        }));
      }, []);

      this._tourers = nextTourers.map(function (nextTourer) {
        var existingTourer = (0, _find2.default)(_this3._tourers, function (t) {
          return t.id === nextTourer.id;
        });
        if (!existingTourer) {
          return _this3.createTourer(nextTourer, points);
        } else {
          return _this3.updateTourer(_extends({}, existingTourer, nextTourer, {
            marker: existingTourer.marker
          }), points);
        }
      });
    }
  }, {
    key: 'createTourer',
    value: function createTourer() {
      var _this4 = this;

      var tourer = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var points = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var distance = tourer.distance;
      var popup = tourer.popup;

      var point = calcTourerPosition(distance, points);
      var icon = this.iconForTourer(tourer);
      var marker = global.L.marker(point, { icon: icon });

      if (popup) {
        marker.bindPopup(popup.content, popup.options);
      }

      marker.on('click', function () {
        _this4.handleMarkerClick(marker);
      });

      marker.tourer_id = tourer.id;
      this._markers.addLayer(marker);

      return _extends({}, tourer, {
        marker: marker
      });
    }
  }, {
    key: 'createTourers',
    value: function createTourers() {
      var _this5 = this;

      var _props2 = this.props;
      var _props2$tourers = _props2.tourers;
      var tourers = _props2$tourers === undefined ? [] : _props2$tourers;
      var _props2$routes = _props2.routes;
      var routes = _props2$routes === undefined ? [] : _props2$routes;

      var points = routes.reduce(function (acc, route) {
        return acc.concat(route.points.map(function (p) {
          return _extends({}, p, {
            distance: p.distance + ((0, _utils.last)(acc) || { distance: 0 }).distance
          });
        }));
      }, []);

      this._tourers = tourers.map(function (tourer) {
        return _this5.createTourer(tourer, points);
      });
    }
  }, {
    key: 'updateRoutes',
    value: function updateRoutes(routes, tourers) {
      var _this6 = this;

      this._routes && this._routes.forEach(function (segment) {
        return _this6._map.removeLayer(segment);
      });
      this._startMarker && this._map.removeLayer(this._startMarker);
      this._finishMarker && this._map.removeLayer(this._finishMarker);
      this.renderRoutes(routes);
      this.updateTourers(tourers, routes);
    }
  }, {
    key: 'renderStartAndFinish',
    value: function renderStartAndFinish(start, finish) {
      this._startMarker = global.L.marker(start, { icon: this._startIcon }).addTo(this._map);
      this._finishMarker = global.L.marker(finish, { icon: this._finishIcon }).addTo(this._map);
    }
  }, {
    key: 'renderRoutes',
    value: function renderRoutes() {
      var routes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      var firstPoint = (0, _utils.first)(((0, _utils.first)(routes) || {}).waypoints);
      var lastPoint = (0, _utils.last)(((0, _utils.last)(routes) || {}).waypoints);
      this._routes = routes.map(this.renderRouteSegment.bind(this));
      this.renderStartAndFinish(firstPoint, lastPoint);
      this._map.fitBounds([firstPoint, lastPoint], {
        padding: [50, 50]
      });
    }
  }, {
    key: 'renderRouteSegment',
    value: function renderRouteSegment(_ref2) {
      var _ref2$style = _ref2.style;
      var style = _ref2$style === undefined ? defaultSegmentStyle : _ref2$style;
      var _ref2$points = _ref2.points;
      var points = _ref2$points === undefined ? [] : _ref2$points;

      return global.L.polyline(points, style).addTo(this._map);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement('div', { style: { width: '100%', height: '100%' } });
    }
  }]);

  return Map;
}(_react2.default.Component);

Map.propTypes = {
  routes: _react.PropTypes.arrayOf(_react.PropTypes.shape({
    points: _react.PropTypes.arrayOf(_react.PropTypes.shape({
      x: _react.PropTypes.number,
      y: _react.PropTypes.number,
      bearing: _react.PropTypes.number,
      distance: _react.PropTypes.number
    })),
    style: _react.PropTypes.object
  })),
  tourers: _react.PropTypes.arrayOf(_react.PropTypes.shape({
    id: _react.PropTypes.string.isRequired,
    distance: _react.PropTypes.number.isRequired,
    popup: _react.PropTypes.shape({
      content: _react.PropTypes.string,
      options: _react.PropTypes.object
    }),
    icon: _react.PropTypes.shape({
      iconSize: _react.PropTypes.arrayOf(_react.PropTypes.number),
      className: _react.PropTypes.string,
      html: _react.PropTypes.string
    })
  }))
};

Map.defaultProps = {
  routes: [],
  tourers: [],
  onSelection: function onSelection() {},
  onTourerDeselection: function onTourerDeselection() {},
  tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.jpg',
  tileAttribution: '&copy; <a href="http://www.esri.com/">Esri</a>'
};

exports.default = Map;