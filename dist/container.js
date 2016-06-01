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
    fetchRoute: function fetchRoute(waypoints) {
      return dispatch((0, _actions.fetchRoute)(waypoints));
    },
    selectTourer: function selectTourer(id) {
      return dispatch((0, _actions.selectTourer)(id));
    }
  };
};

var defaultMapState = function defaultMapState(_ref) {
  var route = _ref.route;
  var selected = _ref.selected;
  var interactive = _ref.interactive;
  return {
    route: route,
    selected: selected,
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
      var waypoints = _props.waypoints;

      fetchRoute(waypoints);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var _props2$waypoints = _props2.waypoints;
      var waypoints = _props2$waypoints === undefined ? [] : _props2$waypoints;
      var _props2$route = _props2.route;
      var route = _props2$route === undefined ? [] : _props2$route;
      var _props2$tourers = _props2.tourers;
      var tourers = _props2$tourers === undefined ? [] : _props2$tourers;
      var _props2$selected = _props2.selected;
      var selected = _props2$selected === undefined ? '' : _props2$selected;
      var _props2$interactive = _props2.interactive;
      var interactive = _props2$interactive === undefined ? true : _props2$interactive;
      var selectTourer = _props2.selectTourer;


      return _react2.default.createElement(_2.default, {
        waypoints: waypoints,
        route: route,
        tourers: tourers,
        selected: selected,
        interactive: interactive,
        onSelection: selectTourer
      });
    }
  }]);

  return Container;
}(_react2.default.Component);

exports.default = function () {
  var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref2$mapState = _ref2.mapState;
  var mapState = _ref2$mapState === undefined ? defaultMapState : _ref2$mapState;
  var _ref2$mapDispatch = _ref2.mapDispatch;
  var mapDispatch = _ref2$mapDispatch === undefined ? defaultMapDispatch : _ref2$mapDispatch;
  return (0, _reactRedux.connect)(mapState, mapDispatch)(Container);
};