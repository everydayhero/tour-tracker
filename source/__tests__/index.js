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
  route = [
    { point: [0, 0], totalDistance: 0, bearing: 90 },
    { point: [0, 50], totalDistance: 5560000 }
  ],
  tourers = [
    { id: '1', distance: 0 },
    { id: '2', distance: 2780000 },
    { id: '3', distance: 5560000 }
  ]
) => (
  mount(<Map
    route={route}
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
    expect(mocklet.marker.getCall(2).args[0]).to.eql([0, 0])
    expect(mocklet.marker.getCall(3).args[0].map((n) => Math.round(n))).to.eql([0, 25])
    expect(mocklet.marker.getCall(4).args[0]).to.eql([0, 50])
  })

  it('updates rider information as it\'s provided to props', () => {
    const map = createSampleMap()
    map.setProps({
      tourers: [
        { id: '1', distance: 2780000 },
        { id: '2', distance: 2780000 },
        { id: '3', distance: 5560000 }
      ]
    })
    expect(setLatLngSpy.getCall(0).args[0].map((n) => Math.round(n))).to.eql([0, 25])
    expect(setLatLngSpy.getCall(1).args[0].map((n) => Math.round(n))).to.eql([0, 25])
    expect(setLatLngSpy.getCall(2).args[0]).to.eql([0, 50])
  })
})
