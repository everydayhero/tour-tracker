import React from 'react'
import logger from 'redux-logger'
import thunk from 'redux-thunk'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider, connect } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'

import { createConnected, reducer, selectTourer } from '../../../source'
import { Pin } from '../../../source/icons'

const TourTracker = createConnected()

const WAYPOINTS = [
    { id: 1, lat: 25.751248, lng: 71.3969271 },
    { id: 2, lat: 25.7532, lng: 71.4181 },
    { id: 3, lat: 26.912416, lng: 75.787247 },
    { id: 4, lat: 28.613946, lng: 77.208949 },
    { id: 5, lat: 30.147977, lng: 78.077645 },
    { id: 6, lat: 26.455604, lng: 80.333899 },
    { id: 7, lat: 25.600060, lng: 85.125679 },
    { id: 8, lat: 27.039177, lng: 88.263870 },
    { id: 9, lat: 25.581305, lng: 91.887587 }
]

const TOURERS = [
  { id: '1', distance: 1000000 },
  { id: '2', distance: 2000000 }
]

const SELECTED_ICON = {
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  className: '',
  html: renderToStaticMarkup(<Pin color='coral' />)
}

const UNSELECTED_ICON = {
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  className: '',
  html: renderToStaticMarkup(<Pin color='#00a044' />)
}

const WAYPOINT_ICON = {
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  className: '',
  html: renderToStaticMarkup(<Pin color='#0D2618' />)
}

const assignIcon = (selected) => (tourer) => {
  if (tourer.id === selected) {
    return ({
      ...tourer,
      icon: SELECTED_ICON
    })
  } else {
    return ({
      ...tourer,
      icon: UNSELECTED_ICON
    })
  }
}

const assignWaypointIcon = (waypoint) => {
  return ({
    ...waypoint,
    icon: WAYPOINT_ICON
  })
}

const INITIAL_STATE = {
  routes: [
    { waypoints: WAYPOINTS.map(assignWaypointIcon) }
  ]
}

const store = createStore(
  reducer,
  INITIAL_STATE,
  applyMiddleware(thunk, logger())
)

const mapDispatch = (dispatch) => ({
  selectTourer: (id) => dispatch(selectTourer(id))
})
const mapState = ({ selected = '1' }) => ({ selected })

const WaypointsExample = ({
  tourers = [],
  selected = '',
  selectTourer
}) => {
  const decoratedTourers = tourers.map(assignIcon(selected))

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <TourTracker
        tourers={decoratedTourers}
        selected={selected}
        focusMode='selected'
        zoom={5}
      />
      <select
        value={selected}
        onChange={(e) => selectTourer(e.target.value)}
        style={{
          position: 'absolute',
          right: '1em',
          top: '1em'
        }}>
        <option value='1'>One</option>
        <option value='2'>Two</option>
      </select>
    </div>
  )
}

const Example = connect(
  mapState,
  mapDispatch
)(WaypointsExample)

export default () => (
  <Provider store={store}>
    <Example
      tourers={TOURERS}
    />
  </Provider>
)
