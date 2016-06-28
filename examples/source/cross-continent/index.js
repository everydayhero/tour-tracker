import React from 'react'
import logger from 'redux-logger'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'

import createConnected from '../../../source/container'
import reducer from '../../../source/reducer'

const TourTracker = createConnected()

const AUS_WAYPOINTS = [
  [-31.953573, 115.857006],
  [-27.465245, 153.028644]
]

const US_WAYPOINTS = [
  [37.7749, -122.4194],
  [40.7128, -74.0059]
]

const TOURERS = [
  { id: '1', distance: 1000000 },
  { id: '2', distance: 6000000 }
]

const INITIAL_STATE = {
  routes: [
    { waypoints: AUS_WAYPOINTS },
    { waypoints: US_WAYPOINTS }
  ]
}

const store = createStore(
  reducer,
  INITIAL_STATE,
  applyMiddleware(thunk, logger())
)

export default () => (
  <Provider store={store}>
    <TourTracker
      tourers={TOURERS}
    />
  </Provider>
)
