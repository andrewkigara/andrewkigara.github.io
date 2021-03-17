// ----- Functional Tools ----- //
import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';

// ----- Components ----//
// import { AutoType } from './Components/AutoType';

// ----- Pages ----//
import { Home } from './Pages/Home';
// import { About } from './Pages/About';


class App extends Component {
  render() {
    return (
      <React.Fragment>
        {/* Nav */}


        {/* Pages */}
        <Router>
          <Switch>
            <Route exact path="/" component={Home}/>
          </Switch>
        </Router>


        {/* Footer */}
      </React.Fragment>
    )
  }
}

export default App;
