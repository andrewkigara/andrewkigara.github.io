// ----- Functional Tools ----- //
import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { Sidebar } from './Components/Sidebar/Sidebar';

// ----- Components ----//
// import { AutoType } from './Components/AutoType';

// ----- Pages ----//
import { Home } from './Pages/Home/Home';
import { About } from './Pages/About/About';
import { Gallery } from './Pages/Gallery/Gallery';
import { Contact } from './Pages/Contact/Contact';
import { Recommendations } from './Pages/Recommendations/Recommendations';


class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Router>
          {/* Nav */}
          <Sidebar/>


          {/* Pages */}
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/about" component={About}/>
            <Route path="/gallery" component={Gallery}/>
            <Route path='/recommendations' component={Recommendations} />
            <Route path="/contact" component={Contact}/>
          </Switch>

          {/* Footer */}
          
        </Router>
      </React.Fragment>
    )
  }
}

export default App;
