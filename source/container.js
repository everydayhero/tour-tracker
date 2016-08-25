import React from 'react'
import TourTracker from './components/Map'
import { connect } from 'react-redux'
import { fetchRoute, selectTourer, selectWaypoint } from './actions'

const isFetchedOrFetching = ({ status } = {}) => status === 'fetched' || status === 'fetching'

const unlessFetched = (resource = {}, fetcher) => (
  isFetchedOrFetching(resource)
    ? Promise.resolve()
    : fetcher()
)

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
    routes.forEach((route, index) => unlessFetched(route, () => fetchRoute(index, route.waypoints)))
  }

  render () {
    return (
      <TourTracker
        {...this.props}
        onSelection={this.props.selectTourer}
        onWaypointSelection={this.props.selectWaypoint}
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
