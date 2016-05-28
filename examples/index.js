import React from 'react'
import TourTracker from '../source'
import reducer from '../source/reducer'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import { Provider } from 'react-redux'
import { connect } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { fetchRoute, selectTourer } from '../source/actions'
import { render } from 'react-dom'

const store = createStore(
  reducer,
  { interactive: true },
  applyMiddleware(thunk, logger())
)

const mapDispatch = (dispatch) => ({
  fetchRoute: (waypoints) => dispatch(fetchRoute(waypoints)),
  selectTourer: (id) => dispatch(selectTourer(id))
})

const mapState = ({
  route,
  selected,
  interactive
}) => ({
  route,
  selected,
  interactive
})

class Tracker extends React.Component {
  componentDidMount () {
    const { fetchRoute, waypoints } = this.props
    fetchRoute(waypoints)
  }

  render () {
    const {
      route = [],
      tourers = [],
      selected = '',
      interactive = true,
      selectTourer
    } = this.props
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {route.length ? <TourTracker
          route={route}
          tourers={tourers}
          selected={selected}
          interactive={interactive}
          onSelection={selectTourer}
        /> : <div>Loading</div>}
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
}

const ConnectedTracker = connect(mapState, mapDispatch)(Tracker)

const waypoints = [
  [-27.465245, 153.028644],
  [-31.953573, 115.857006]
]

const tourers = [
  { id: '1', distance: 1000000 },
  { id: '2', distance: 2000000 }
]

render(
  <Provider store={store}>
    <ConnectedTracker
      waypoints={waypoints}
      tourers={tourers}
    />
  </Provider>,
  document.getElementById('mount')
)
