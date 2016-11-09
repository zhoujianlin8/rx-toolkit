'use strict';
import React from 'react';
import { Router, Route, Link,IndexRoute } from 'react-router';
import Index from './r/index/index';
import Layout from './layout/layout';
const Routers = (
    <Router>
	    <Route path="/" component={Layout}>
	      <IndexRoute component={Index} />
	      <Route path="index" component={Index}/>
	      <Route path="*" component={Index}/>
	    </Route>
  </Router>
);
export default Routers;