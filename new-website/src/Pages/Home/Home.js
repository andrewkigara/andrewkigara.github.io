import React from 'react';
import Typical from 'react-typical';
import redditDude from '../../Assets/redditDude.png';

export const Home = () => {
    return (
        <div className="container">
            <div className="row">
                {/* Reddit dude */}
                <div className="col-4 align-self-start">
                    <img src={redditDude} alt="reddit man" height="auto" width="60%"/>
                </div>
                {/* Auto-type */}
                <div className="col-4 align-self-center">
                    <h1>Hello :)</h1>
                    <h3>My name is André</h3>
                    <p>I am {' '}
                        {/* <Typical
                            loop={Infinity}
                            wrapper="b"
                            steps={[
                                'a software developer',
                                1000,
                                'a web designer',
                                1000,
                                'a web developer',
                                1000,
                                'a graphic designer',
                                1000,
                            ]}
                        /> */}
                    </p>
                </div>
                {/* Buttons */}

            </div>

        </div>
    )
}


