'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Checkerboard = exports.Pin = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Pin = exports.Pin = function Pin(_ref) {
  var _ref$color = _ref.color;
  var color = _ref$color === undefined ? '#00a044' : _ref$color;
  var _ref$dotColor = _ref.dotColor;
  var dotColor = _ref$dotColor === undefined ? 'white' : _ref$dotColor;
  var _ref$shadowColor = _ref.shadowColor;
  var shadowColor = _ref$shadowColor === undefined ? 'rgba(0, 0, 0, 0.125)' : _ref$shadowColor;
  return _react2.default.createElement(
    'div',
    { style: {
        transform: 'translate(0, -20%)',
        width: '100%',
        height: '100%'
      } },
    _react2.default.createElement('div', { style: {
        background: shadowColor,
        borderRadius: '50%',
        height: '60%',
        width: '60%',
        position: 'absolute',
        left: '50%',
        bottom: '-50%',
        transformOrigin: '50% 50%',
        transform: 'rotateX(55deg) translate(-50%, 0)'
      } }),
    _react2.default.createElement(
      'div',
      { style: {
          width: '100%',
          height: '100%',
          borderRadius: '50% 50% 50% 0',
          backgroundColor: color,
          position: 'absolute',
          transform: 'rotate(-45deg)',
          transformOrigin: '50% 50%'
        } },
      _react2.default.createElement('div', { style: {
          width: '50%',
          height: '50%',
          backgroundColor: dotColor,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%'
        } })
    )
  );
};

var checkerBoard = function checkerBoard(color) {
  return {
    backgroundColor: 'white',
    backgroundSize: '10px 10px',
    backgroundImage: ['linear-gradient(45deg, ' + color + ' 25%, transparent 25%)', 'linear-gradient(-45deg, ' + color + ' 25%, transparent 25%)', 'linear-gradient(45deg, transparent 75%, ' + color + ' 75%)', 'linear-gradient(-45deg, transparent 75%, ' + color + ' 75%)'].join(',')
  };
};

var Checkerboard = exports.Checkerboard = function Checkerboard(_ref2) {
  var _ref2$color = _ref2.color;
  var color = _ref2$color === undefined ? 'black' : _ref2$color;
  return _react2.default.createElement('div', { style: _extends({}, checkerBoard(color), {
      border: '2px solid white',
      boxShadow: '0 0 0 5px rgba(0, 0, 0, 0.125)',
      borderRadius: '100%',
      width: '100%',
      height: '100%'
    }) });
};