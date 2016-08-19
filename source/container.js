import React from 'react'
import TourTracker from './'
import { connect } from 'react-redux'
import { fetchRoute, selectTourer, selectWaypoint } from './actions'

const defaultMapDispatch = (dispatch) => ({
  fetchRoute: (index, route) => dispatch(fetchRoute(index, route)),
  selectTourer: (id) => dispatch(selectTourer(id)),
  selectWaypoint: (id) => dispatch(selectWaypoint(id))
})

const defaultMapState = ({
  routes = [],
  interactive
}) => ({
  routes,
  interactive
})

class Container extends React.Component {
  componentDidMount () {
    const { fetchRoute, routes } = this.props
    routes.forEach(({ waypoints }, index) => fetchRoute(index, waypoints))
  }

  render () {
    const {
      routes = [],
      tourers = [],
      selected = '',
      tileUrl = '',
      interactive = true,
      selectTourer,
      selectWaypoint
    } = this.props

    return (
      <TourTracker
        routes={routes}
        tourers={tourers}
        selected={selected}
        tileUrl={tileUrl}
        interactive={interactive}
        onSelection={selectTourer}
        onWaypointSelection={selectWaypoint}
      />
    )
  }
}

export default ({
  mapState = defaultMapState,
  mapDispatch = defaultMapDispatch
} = {}) => (
  connect(mapState, mapDispatch)(Container)
)
