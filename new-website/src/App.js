import React from 'react';
// import AutoType from './pages/AutoType';
import './App.css';
import redditDude from './assets/redditDude.png';

function App() {
  return (
    <div className="container text-center justify-content-center">
      <img className="redditDude mt-3" src={redditDude} alt="reddit dude"/>
      {/* <AutoType /> */}
    </div>
  );
}

export default App;
