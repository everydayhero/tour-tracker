import React from 'react'
import TourTracker from './'
import { connect } from 'react-redux'
import { fetchRoute, selectTourer } from './actions'

const defaultMapDispatch = (dispatch) => ({
  fetchRoute: (waypoints) => dispatch(fetchRoute(waypoints)),
  selectTourer: (id) => dispatch(selectTourer(id))
})

const defaultMapState = ({
  route,
  selected,
  interactive
}) => ({
  route,
  selected,
  interactive
})

class Container extends React.Component {
  componentDidMount () {
    const { fetchRoute, waypoints } = this.props
    fetchRoute(waypoints)
  }

  render () {
    const {
      waypoints = [],
      route = [],
      tourers = [],
      selected = '',
      interactive = true,
      selectTourer
    } = this.props

    return (
      <TourTracker
        waypoints={waypoints}
        route={route}
        tourers={tourers}
        selected={selected}
        interactive={interactive}
        onSelection={selectTourer}
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
