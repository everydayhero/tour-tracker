import React from 'react'
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'
import { render } from 'react-dom'

import Selectable from './selectable'

const Index = () => (
  <Link to='/selectable'>Selectable</Link>
)

const Id = ({ children }) => children

render(
  <Router history={browserHistory}>
    <Route path='/' component={Id}>
      <IndexRoute component={Index} />
      <Route path='/selectable' component={Selectable} />
    </Route>
  </Router>,
  document.getElementById('mount')
)
