import React from 'react'
import chai, { expect } from 'chai'
import chaiEnzyme from 'chai-enzyme'
import jsdom from 'mocha-jsdom'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { describe, before, it } from 'mocha'
import { mount } from 'enzyme'

chai.use(chaiEnzyme())

const setLatLngSpy = sinon.spy()
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
      fitBounds () {}
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

const createSampleMap = (
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
  ]
) => (
  mount(<Map
    routes={routes}
    tourers={tourers}
  />)
)

let Map

describe('Map', () => {
  jsdom()

  before(() => {
    Map = proxyquire('../', { 'leaflet': mocklet }).default
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
    createSampleMap(
      [
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
      [
        { id: '1', distance: 8340000 }
      ]
    )

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
