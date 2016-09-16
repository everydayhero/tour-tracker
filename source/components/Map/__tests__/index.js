import React from 'react'
import chai, { expect } from 'chai'
import chaiEnzyme from 'chai-enzyme'
import jsdom from 'mocha-jsdom'
import sinon from 'sinon'
import { describe, after, it } from 'mocha'
import { mount } from 'enzyme'
import Map from '../'

chai.use(chaiEnzyme())

const setLatLngSpy = sinon.spy()
const fitBoundsSpy = sinon.spy()
const mocklet = {
  map: sinon.spy(function () {
    return {
      addLayer () {},
      dragging: { disable () {}, enable () {} },
      touchZoom: { disable () {}, enable () {} },
      doubleClickZoom: { disable () {}, enable () {} },
      scrollWheelZoom: { disable () {}, enable () {} },
      keyboard: { disable () {}, enable () {} },
      on () {},
      fitBounds: fitBoundsSpy
    }
  }),

  divIcon () {},

  point () {},

  tileLayer () {
    return {
      addTo () {}
    }
  },

  featureGroup () {
    return {
      addLayer () {}
    }
  },

  addLayer () {},

  polyline () {
    return {
      addTo () {}
    }
  },

  marker: sinon.spy(function () {
    return {
      on () {},
      bindPopup () { return this },
      setIcon () {},
      setLatLng: setLatLngSpy,
      addTo () {},
      setPopupContent () {}
    }
  })
}

const createSampleMap = (args = {}) => {
  const {
    routes = [
      {
        waypoints: [
          [0, 0],
          [0, 50]
        ],
        points: [
          { lat: 0, lng: 0, distance: 0, bearing: 90 },
          { lat: 0, lng: 50, distance: 5560000 }
        ]
      }
    ],
    tourers = [
      { id: '1', distance: 0 },
      { id: '2', distance: 2780000 },
      { id: '3', distance: 5560000 }
    ],
    ...props
  } = args

  return mount(<Map
    routes={routes}
    tourers={tourers}
    {...props}
  />)
}

const initialL = global.L
global.L = mocklet

describe('Map', () => {
  jsdom()

  after(() => {
    global.L = initialL
  })

  it('creates a leaflet map on mount', () => {
    mount(<Map />)
    expect(mocklet.map.called).to.be.ok
  })

  it('creates a leafter marker for each supplied tourer as well the start and finish points', () => {
    mocklet.marker.reset()
    createSampleMap()
    expect(mocklet.marker.callCount).to.eq(5)
  })

  it('positions the start marker at the first route point', () => {
    mocklet.marker.reset()
    createSampleMap()
    expect(mocklet.marker.getCall(0).args[0]).to.eql([0, 0])
  })

  it('positions the finish marker at the lasst route point', () => {
    mocklet.marker.reset()
    createSampleMap()
    expect(mocklet.marker.getCall(1).args[0]).to.eql([0, 50])
  })

  it('will fit the route inside the bounds of the viewport', () => {
    fitBoundsSpy.reset()
    createSampleMap()
    expect(fitBoundsSpy.getCall(0).args[0]).to.eql([[0, 0], [0, 50]])
  })

  it('will call fitBounds on the selected rider\'s coords when focusMode is set to selected', () => {
    fitBoundsSpy.reset()
    createSampleMap({ selected: '2', focusMode: 'selected' })
    expect({
      lat: Math.round(fitBoundsSpy.getCall(0).args[0][0].lat),
      lng: Math.round(fitBoundsSpy.getCall(0).args[0][0].lng)
    }).to.eql({
      lat: 0,
      lng: 25
    })
  })

  it('will call fitBounds with a specified zoom when the focusMode is set to the selected rider', () => {
    fitBoundsSpy.reset()
    createSampleMap({ selected: '2', focusMode: 'selected', zoom: 99 })
    expect(fitBoundsSpy.getCall(0).args[1].maxZoom).to.eql(99)
  })

  it('positions the rider\'s markers according to how far along the route they are', () => {
    mocklet.marker.reset()
    createSampleMap()

    const first = mocklet.marker.getCall(2).args[0]
    const second = mocklet.marker.getCall(3).args[0]
    const third = mocklet.marker.getCall(4).args[0]

    expect({
      lat: first.lat,
      lng: first.lng
    }).to.eql({
      lat: 0,
      lng: 0
    })
    expect({
      lat: Math.round(second.lat),
      lng: Math.round(second.lng)
    }).to.eql({
      lat: 0,
      lng: 25
    })
    expect({
      lat: third.lat,
      lng: third.lng
    }).to.eql({
      lat: 0,
      lng: 50
    })
  })

  it('updates rider information as it\'s provided to props', () => {
    const map = createSampleMap()
    setLatLngSpy.reset()

    map.setProps({
      tourers: [
        { id: '1', distance: 2780000 },
        { id: '2', distance: 2780000 },
        { id: '3', distance: 5560000 }
      ]
    })

    const first = setLatLngSpy.getCall(0).args[0]
    const second = setLatLngSpy.getCall(1).args[0]
    const third = setLatLngSpy.getCall(2).args[0]

    expect({
      lat: Math.round(first.lat),
      lng: Math.round(first.lng)
    }).to.eql({
      lat: 0,
      lng: 25
    })
    expect({
      lat: Math.round(second.lat),
      lng: Math.round(second.lng)
    }).to.eql({
      lat: 0,
      lng: 25
    })
    expect({
      lat: third.lat,
      lng: third.lng
    }).to.eql({
      lat: 0,
      lng: 50
    })
  })

  it('can plot a rider along multiple route-segments', () => {
    mocklet.marker.reset()
    createSampleMap({
      routes: [
        {
          waypoints: [
            [0, 0],
            [0, 50]
          ],
          points: [
            { lat: 0, lng: 0, distance: 0, bearing: 90 },
            { lat: 0, lng: 50, distance: 5560000 }
          ]
        },
        {
          waypoints: [
            [0, 100],
            [0, 150]
          ],
          points: [
            { lat: 0, lng: 100, distance: 0, bearing: 90 },
            { lat: 0, lng: 150, distance: 5560000 }
          ]
        }
      ],
      tourers: [
        { id: '1', distance: 8340000 }
      ]
    })

    const point = mocklet.marker.getCall(2).args[0]
    expect({
      lat: Math.round(point.lat),
      lng: Math.round(point.lng)
    }).to.eql({
      lat: 0,
      lng: 125
    })
  })
})
