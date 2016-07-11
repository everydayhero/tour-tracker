import './vendor-globals'

import React from 'react'
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'
import { render } from 'react-dom'

import Selectable from './selectable'
import CustomPopup from './custom-popup'
import CrossContinent from './cross-continent'

const Index = () => (
  <nav>
    <Link to='/cross-continent'>Cross continent</Link>
    <Link to='/custom-popup'>Custom popup</Link>
    <Link to='/selectable'>Selectable</Link>
  </nav>
)

const Id = ({ children }) => children

render(
  <Router history={browserHistory}>
    <Route path='/' component={Id}>
      <IndexRoute component={Index} />
      <Route path='/cross-continent' component={CrossContinent} />
      <Route path='/custom-popup' component={CustomPopup} />
      <Route path='/selectable' component={Selectable} />
    </Route>
  </Router>,
  document.getElementById('mount')
)
