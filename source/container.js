import React from 'react'
import TourTracker from './'
import { connect } from 'react-redux'
import { fetchRoute, selectTourer } from './actions'

const defaultMapDispatch = (dispatch) => ({
  fetchRoute: (index, route) => dispatch(fetchRoute(index, route)),
  selectTourer: (id) => dispatch(selectTourer(id))
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
      interactive = true,
      selectTourer
    } = this.props

    return (
      <TourTracker
        routes={routes}
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
