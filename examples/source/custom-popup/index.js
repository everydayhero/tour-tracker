import React from 'react'
import logger from 'redux-logger'
import thunk from 'redux-thunk'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'

import { createConnected, reducer } from '../../../source'

const TourTracker = createConnected()

const WAYPOINTS = [
  { lat: -27.465245, lng: 153.028644},
  { lat: -31.953573, lng: 115.857006}
]

const TOURERS = [
  { id: '1', distance: 1000000, data: { name: 'Billy' } },
  { id: '2', distance: 2000000, data: { name: 'Bob' }}
]

const INITIAL_STATE = {
  routes: [
    { waypoints: WAYPOINTS }
  ]
}

const store = createStore(
  reducer,
  INITIAL_STATE,
  applyMiddleware(thunk, logger())
)

const Popup = ({ name }) => (
  <h1>{name}</h1>
)

const assignPopup = (tourer) => ({
  ...tourer,
  popup: {
    content: renderToStaticMarkup(<Popup {...tourer.data} />),
    options: {
      className: 'custom-popup',
      offset: [0, -18],
      maxWidth: 320,
      minWidth: 320,
      closeOnClick: false
    }
  }
})

const popupCss = `
  .custom-popup .leaflet-popup-content-wrapper {
    background: white;
    color: grey;
    font-size: 16px;
    line-height: 24px;
    border-radius: 0;
    border: none;
    border-bottom: 5px solid #2e8b57;
  }

  .custom-popup .leaflet-popup-tip-container {
    width: 30px;
    height: 30px;
  }

  .custom-popup .leaflet-popup-tip {
    background-color: #2e8b57;
  }

  .custom-popup .leaflet-popup-content-wrapper {
    box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.125)
  }
  .custom-popup .leaflet-popup-tip {
    box-shadow: none
  }

  .custom-popup a.leaflet-popup-close-button {
    color: #2e8b57;
    right: 0.5em;
    top: 0.5em;
    display: block;
    padding: 0.25em;
    width: 1em;
    height: 1em;
    line-height: 1em;
  }
`

const CustomPopup = ({
  tourers = [],
  selectTourer
}) => {
  const decoratedTourers = tourers.map(assignPopup)

  return (
    <div style={{
      width: '100%',
      height: '100%'
    }}>
      <style>
        {popupCss}
      </style>
      <TourTracker
        tourers={decoratedTourers}
      />
    </div>
  )
}

export default () => (
  <Provider store={store}>
    <CustomPopup
      tourers={TOURERS}
    />
  </Provider>
)
