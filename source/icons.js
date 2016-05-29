import React from 'react'

export const Pin = ({
  color = '#00a044',
  dotColor = 'white',
  shadowColor = 'rgba(0, 0, 0, 0.125)'
}) => (
  <div style={{
    transform: 'translate(0, -20%)',
    width: '100%',
    height: '100%'
  }}>
    <div style={{
      background: shadowColor,
      borderRadius: '50%',
      height: '60%',
      width: '60%',
      position: 'absolute',
      left: '50%',
      bottom: '-50%',
      transformOrigin: '50% 50%',
      transform: 'rotateX(55deg) translate(-50%, 0)'
    }} />
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: '50% 50% 50% 0',
      backgroundColor: color,
      position: 'absolute',
      transform: 'rotate(-45deg)',
      transformOrigin: '50% 50%'
    }}>
      <div style={{
        width: '50%',
        height: '50%',
        backgroundColor: dotColor,
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%'
      }} />
    </div>
  </div>
)

const checkerBoard = (color) => ({
  backgroundColor: 'white',
  backgroundSize: '10px 10px',
  backgroundImage: [
    `linear-gradient(45deg, ${color} 25%, transparent 25%)`,
    `linear-gradient(-45deg, ${color} 25%, transparent 25%)`,
    `linear-gradient(45deg, transparent 75%, ${color} 75%)`,
    `linear-gradient(-45deg, transparent 75%, ${color} 75%)`
  ].join(',')
})

export const Checkerboard = ({ color = 'black' }) => (
  <div style={{
    ...checkerBoard(color),
    border: '2px solid white',
    boxShadow: '0 0 0 5px rgba(0, 0, 0, 0.125)',
    borderRadius: '100%',
    width: '100%',
    height: '100%'
  }} />
)
