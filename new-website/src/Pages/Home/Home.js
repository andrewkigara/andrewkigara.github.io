import React from 'react';
import Typical from 'react-typical';

export const Home = () => {
    return (
        <div className="container">
            <h1>Hello</h1>
            <h2>My name is <em>Andrew</em></h2>
            <p>I'm a {' '}
                <Typical
                    loop={Infinity}
                    wrapper="b"
                    steps={[
                        'developer',
                        1000,
                        'designer',
                        1000,
                        'photographer',
                        1000,
                        'programmer',
                        1000,
                        'analyst',
                        1000,
                    ]}
                />

            </p>

        </div>
    )
}