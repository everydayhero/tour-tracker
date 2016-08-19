'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _reactRedux = require('react-redux');

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultMapDispatch = function defaultMapDispatch(dispatch) {
  return {
    fetchRoute: function fetchRoute(index, route) {
      return dispatch((0, _actions.fetchRoute)(index, route));
    },
    selectTourer: function selectTourer(id) {
      return dispatch((0, _actions.selectTourer)(id));
    },
    selectWaypoint: function selectWaypoint(id) {
      return dispatch((0, _actions.selectWaypoint)(id));
    }
  };
};

var defaultMapState = function defaultMapState(_ref) {
  var _ref$routes = _ref.routes;
  var routes = _ref$routes === undefined ? [] : _ref$routes;
  var interactive = _ref.interactive;
  return {
    routes: routes,
    interactive: interactive
  };
};

var Container = function (_React$Component) {
  _inherits(Container, _React$Component);

  function Container() {
    _classCallCheck(this, Container);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Container).apply(this, arguments));
  }

  _createClass(Container, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _props = this.props;
      var fetchRoute = _props.fetchRoute;
      var routes = _props.routes;

      routes.forEach(function (_ref2, index) {
        var waypoints = _ref2.waypoints;
        return fetchRoute(index, waypoints);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var _props2$routes = _props2.routes;
      var routes = _props2$routes === undefined ? [] : _props2$routes;
      var _props2$tourers = _props2.tourers;
      var tourers = _props2$tourers === undefined ? [] : _props2$tourers;
      var _props2$selected = _props2.selected;
      var selected = _props2$selected === undefined ? '' : _props2$selected;
      var _props2$tileUrl = _props2.tileUrl;
      var tileUrl = _props2$tileUrl === undefined ? '' : _props2$tileUrl;
      var _props2$interactive = _props2.interactive;
      var interactive = _props2$interactive === undefined ? true : _props2$interactive;
      var selectTourer = _props2.selectTourer;
      var selectWaypoint = _props2.selectWaypoint;


      return _react2.default.createElement(_2.default, {
        routes: routes,
        tourers: tourers,
        selected: selected,
        tileUrl: tileUrl,
        interactive: interactive,
        onSelection: selectTourer,
        onWaypointSelection: selectWaypoint
      });
    }
  }]);

  return Container;
}(_react2.default.Component);

exports.default = function () {
  var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref3$mapState = _ref3.mapState;
  var mapState = _ref3$mapState === undefined ? defaultMapState : _ref3$mapState;
  var _ref3$mapDispatch = _ref3.mapDispatch;
  var mapDispatch = _ref3$mapDispatch === undefined ? defaultMapDispatch : _ref3$mapDispatch;
  return (0, _reactRedux.connect)(mapState, mapDispatch)(Container);
};